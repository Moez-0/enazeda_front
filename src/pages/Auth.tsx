import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone } from "lucide-react";
import { renderGoogleButton, initializeGoogleAuth } from "@/lib/googleAuth";
import { api } from "@/lib/api";
type AuthMethod = "email" | "phone";

const Auth = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, requestOTP, verifyOTP } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Use signup endpoint
        const response = await api.emailSignup(email, password);
        api.setToken(response.token);
        // Manually set user since we have the response
        localStorage.setItem("enazeda_user", JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          provider: response.user.provider,
          trustScore: response.user.trustScore,
        }));
        toast({
          title: t("auth.welcome"),
          description: "Account created successfully!",
        });
        navigate("/app");
        // Reload to update auth state
        window.location.reload();
      } else {
        await login(email, "email", password);
        toast({
          title: t("auth.welcome"),
          description: "You've successfully signed in.",
        });
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (googleClientId && method === "email" && step === "input") {
      const handleGoogleSuccess = async (credential: string) => {
        setIsLoading(true);
        try {
          await loginWithGoogle(credential);
          toast({
            title: t("auth.welcome"),
            description: "You've successfully signed in with Google.",
          });
          navigate("/app");
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to sign in with Google. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      const checkGoogleLoaded = setInterval(() => {
        if (window.google && googleButtonRef.current) {
          clearInterval(checkGoogleLoaded);
          
          initializeGoogleAuth(googleClientId, handleGoogleSuccess);
          
          renderGoogleButton(
            "google-signin-button",
            googleClientId,
            handleGoogleSuccess
          );
        }
      }, 100);

      return () => clearInterval(checkGoogleLoaded);
    }
  }, [googleClientId, method, step, loginWithGoogle, navigate, toast, t]);

  const handleGoogleLogin = () => {
    // The button will handle the login via the Google Sign-In script
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast({
        title: "Error",
        description: "Google Sign-In is not available. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = phone.startsWith("+") ? phone : `+216${phone}`;
    if (formattedPhone.length >= 8) {
      setIsLoading(true);
      try {
        await requestOTP(formattedPhone);
        setStep("otp");
        toast({
          title: "Code sent",
          description: "Check your phone for the verification code.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to send code. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+216${phone}`;
      await verifyOTP(formattedPhone, code);
      toast({
        title: t("auth.welcome"),
        description: "You've successfully signed in.",
      });
      navigate("/app");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <div className="w-full max-w-sm">
          {method === "email" && step === "input" ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                  {t("auth.welcome")}
                </h1>
                <p className="text-sm text-foreground/70">
                  {t("auth.subtitle")}
                </p>
              </div>

              <div className="space-y-4">
                <div id="google-signin-button" ref={googleButtonRef} className="w-full flex justify-center"></div>
                {!googleClientId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full border-border/30"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {t("auth.google")}
                  </Button>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-foreground/60">{t("auth.or")}</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-foreground/80 mb-2 font-medium">
                      {t("auth.email")}
                    </label>
                    <Input
                      type="email"
                      placeholder={t("auth.email.placeholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-card border-border/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-foreground/80 mb-2 font-medium">
                      {t("auth.password")}
                    </label>
                    <Input
                      type="password"
                      placeholder={t("auth.password.placeholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-card border-border/30"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={!email || !password || isLoading}
                  >
                    {isLoading ? "Signing in..." : isSignUp ? t("auth.signup") : t("auth.signin")}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {isSignUp ? t("auth.haveaccount") : t("auth.noaccount")}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-foreground/60">{t("auth.or")}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setMethod("phone");
                    setEmail("");
                    setPassword("");
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {t("auth.phone.option")}
                </Button>
              </div>
            </>
          ) : method === "phone" && step === "input" ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                  {t("auth.welcome")}
                </h1>
                <p className="text-sm text-foreground/70">
                  {t("auth.subtitle")}
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="border border-border/30 p-4 rounded-lg bg-card">
                  <p className="text-xs text-foreground/80 mb-2 font-medium">{t("auth.phone")}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">+216</span>
                    <Input
                      type="tel"
                      placeholder="XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-transparent border-0 p-0 text-sm focus-visible:ring-0"
                      maxLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={phone.length < 8 || isLoading}
                >
                  {isLoading ? t("auth.sending") : t("auth.continue")}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setMethod("email");
                    setPhone("");
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t("auth.switch")}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                  {t("auth.verify")}
                </h1>
                <p className="text-sm text-foreground/70 mb-1">
                  {t("auth.sent")}
                </p>
                <p className="text-sm font-medium text-foreground">
                  +216 {phone}
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-semibold bg-card border-border/30 focus:border-primary"
                  />
                ))}
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full mb-4"
                onClick={handleVerify}
                disabled={otp.join("").length !== 6 || isLoading}
              >
                {isLoading ? t("auth.verifying") : t("auth.verifybutton")}
              </Button>

              <button
                onClick={() => {
                  setStep("input");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="w-full text-center text-xs text-foreground/70 hover:text-foreground transition-colors"
              >
                {t("auth.change")}
              </button>
            </>
          )}

          <p className="text-center text-xs text-foreground/60 mt-8 leading-relaxed">
            {t("auth.agree")}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
