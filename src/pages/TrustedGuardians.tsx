import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Edit2, Shield } from "lucide-react";

interface Guardian {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

const TrustedGuardians = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGuardians();
  }, []);

  const loadGuardians = async () => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem("enazeda_guardians");
      if (saved) {
        setGuardians(JSON.parse(saved));
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getContacts("guardian");
      setGuardians(response.contacts);
    } catch (error) {
      const saved = localStorage.getItem("enazeda_guardians");
      if (saved) {
        setGuardians(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: t("guardians.error.title"),
        description: t("guardians.error.desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAuthenticated) {
        const response = await api.addContact({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          type: "guardian",
        });
        setGuardians([...guardians, response.contact]);
      } else {
        const newGuardian: Guardian = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
        };
        setGuardians([...guardians, newGuardian]);
        localStorage.setItem("enazeda_guardians", JSON.stringify([...guardians, newGuardian]));
      }
      setFormData({ name: "", phone: "", email: "" });
      setIsAdding(false);
      toast({
        title: t("guardians.added.title"),
        description: t("guardians.added.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add guardian",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (guardian: Guardian) => {
    setEditingId(guardian.id);
    setFormData({
      name: guardian.name,
      phone: guardian.phone,
      email: guardian.email || "",
    });
    setIsAdding(true);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !editingId) {
      toast({
        title: t("guardians.error.title"),
        description: t("guardians.error.desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAuthenticated) {
        const response = await api.updateContact(editingId, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          type: "guardian",
        });
        setGuardians(guardians.map((g) => (g.id === editingId ? response.contact : g)));
      } else {
        const updated = guardians.map((g) =>
          g.id === editingId
            ? {
                ...g,
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || undefined,
              }
            : g
        );
        setGuardians(updated);
        localStorage.setItem("enazeda_guardians", JSON.stringify(updated));
      }
      setFormData({ name: "", phone: "", email: "" });
      setIsAdding(false);
      setEditingId(null);
      toast({
        title: t("guardians.updated.title"),
        description: t("guardians.updated.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update guardian",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isAuthenticated) {
        await api.deleteContact(id);
        setGuardians(guardians.filter((g) => g.id !== id));
      } else {
        const updated = guardians.filter((g) => g.id !== id);
        setGuardians(updated);
        localStorage.setItem("enazeda_guardians", JSON.stringify(updated));
      }
      toast({
        title: t("guardians.deleted.title"),
        description: t("guardians.deleted.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete guardian",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "" });
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
              {t("profile.guardians")}
            </h1>
            <p className="text-xs text-foreground/80 mt-1">
              {t("profile.guardians.desc")}
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
              {t("guardians.add")}
            </Button>

            {guardians.length === 0 ? (
              <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
                <Shield className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-foreground/80 mb-2">
                  {t("guardians.empty.title")}
                </p>
                <p className="text-xs text-foreground/60">
                  {t("guardians.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {guardians.map((guardian) => (
                  <div
                    key={guardian.id}
                    className="border border-border/30 p-4 bg-card rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {guardian.name}
                        </p>
                        <p className="text-xs text-foreground/80 mt-1">
                          {guardian.phone}
                        </p>
                        {guardian.email && (
                          <p className="text-xs text-foreground/60 mt-1">
                            {guardian.email}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(guardian)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-foreground/70" />
                        </button>
                        <button
                          onClick={() => handleDelete(guardian.id)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
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
                {t("guardians.form.name")}
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("guardians.form.name.placeholder")}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/80 mb-1 block">
                {t("guardians.form.phone")}
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t("guardians.form.phone.placeholder")}
                className="bg-background"
                type="tel"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/80 mb-1 block">
                {t("guardians.form.email")} ({t("guardians.form.email.optional")})
              </label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t("guardians.form.email.placeholder")}
                className="bg-background"
                type="email"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                variant="hero"
                size="lg"
                className="flex-1"
              >
                {editingId ? t("guardians.update") : t("guardians.save")}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {t("guardians.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustedGuardians;
