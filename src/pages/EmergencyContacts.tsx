import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Edit2, Phone } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    if (!isAuthenticated) {
      // Fallback to localStorage
      const saved = localStorage.getItem("enazeda_emergency_contacts");
      if (saved) {
        setContacts(JSON.parse(saved));
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getContacts("emergency");
      setContacts(response.contacts);
    } catch (error) {
      // Fallback to localStorage
      const saved = localStorage.getItem("enazeda_emergency_contacts");
      if (saved) {
        setContacts(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem("enazeda_emergency_contacts", JSON.stringify(newContacts));
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: t("contacts.error.title"),
        description: t("contacts.error.desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAuthenticated) {
        const response = await api.addContact({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          type: "emergency",
        });
        setContacts([...contacts, response.contact]);
      } else {
        // Fallback to localStorage
        const newContact: Contact = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
        };
        setContacts([...contacts, newContact]);
        localStorage.setItem("enazeda_emergency_contacts", JSON.stringify([...contacts, newContact]));
      }
      setFormData({ name: "", phone: "" });
      setIsAdding(false);
      toast({
        title: t("contacts.added.title"),
        description: t("contacts.added.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setFormData({ name: contact.name, phone: contact.phone });
    setIsAdding(true);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !editingId) {
      toast({
        title: t("contacts.error.title"),
        description: t("contacts.error.desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAuthenticated) {
        const response = await api.updateContact(editingId, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          type: "emergency",
        });
        setContacts(contacts.map((c) => (c.id === editingId ? response.contact : c)));
      } else {
        // Fallback to localStorage
        const updated = contacts.map((c) =>
          c.id === editingId
            ? { ...c, name: formData.name.trim(), phone: formData.phone.trim() }
            : c
        );
        setContacts(updated);
        localStorage.setItem("enazeda_emergency_contacts", JSON.stringify(updated));
      }
      setFormData({ name: "", phone: "" });
      setIsAdding(false);
      setEditingId(null);
      toast({
        title: t("contacts.updated.title"),
        description: t("contacts.updated.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isAuthenticated) {
        await api.deleteContact(id);
        setContacts(contacts.filter((c) => c.id !== id));
      } else {
        // Fallback to localStorage
        const updated = contacts.filter((c) => c.id !== id);
        setContacts(updated);
        localStorage.setItem("enazeda_emergency_contacts", JSON.stringify(updated));
      }
      toast({
        title: t("contacts.deleted.title"),
        description: t("contacts.deleted.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", phone: "" });
  };

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/app/profile")}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-foreground">
              {t("profile.contacts")}
            </h1>
            <p className="text-xs text-foreground/80 mt-1">
              {t("profile.contacts.desc")}
            </p>
          </div>
        </div>

        {!isAdding ? (
          <>
            <Button
              onClick={() => setIsAdding(true)}
              variant="hero"
              size="lg"
              className="w-full mb-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("contacts.add")}
            </Button>

            {contacts.length === 0 ? (
              <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
                <Phone className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-foreground/80 mb-2">
                  {t("contacts.empty.title")}
                </p>
                <p className="text-xs text-foreground/60">
                  {t("contacts.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border border-border/30 p-4 bg-card rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {contact.name}
                      </p>
                      <p className="text-xs text-foreground/80 mt-1">
                        {contact.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-foreground/70" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="border border-border/30 p-4 bg-card rounded-lg space-y-4">
            <div>
              <label className="text-xs text-foreground/80 mb-1 block">
                {t("contacts.form.name")}
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("contacts.form.name.placeholder")}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/80 mb-1 block">
                {t("contacts.form.phone")}
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t("contacts.form.phone.placeholder")}
                className="bg-background"
                type="tel"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                variant="hero"
                size="lg"
                className="flex-1"
              >
                {editingId ? t("contacts.update") : t("contacts.save")}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {t("contacts.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;
