const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("enazeda_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== "undefined") {
      localStorage.setItem("enazeda_token", token);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("enazeda_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: "An error occurred" },
      }));
      throw new Error(error.error?.message || "Request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async requestOTP(phone: string) {
    return this.request<{ message: string; otp?: string }>("/auth/phone/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone: string, code: string) {
    return this.request<{ token: string; user: any }>("/auth/phone/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
  }

  async emailSignup(email: string, password: string, name?: string) {
    return this.request<{ token: string; user: any }>("/auth/email/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async emailLogin(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/auth/email/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(credential: string) {
    return this.request<{ token: string; user: any }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<{
      id: string;
      phone?: string;
      email?: string;
      name?: string;
      provider: string;
      trustScore: number;
    }>("/users/me");
  }

  async updateProfile(data: { name?: string }) {
    return this.request<{
      id: string;
      phone?: string;
      email?: string;
      name?: string;
      provider: string;
      trustScore: number;
    }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Report endpoints
  async createReport(data: {
    type: "verbal" | "physical" | "stalking" | "assault";
    location: { lat: number; lng: number; address?: string };
    description?: string;
    isAnonymous?: boolean;
  }) {
    return this.request<{
      id: string;
      type: string;
      location: any;
      description?: string;
      status: string;
      createdAt: string;
    }>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHeatmap(lat: number, lng: number, radius: number = 5000) {
    return this.request<{ reports: any[] }>(
      `/reports/heatmap?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  }

  async getMyReports() {
    return this.request<{
      reports: Array<{
        id: string;
        type: string;
        location: any;
        description?: string;
        status: string;
        createdAt: string;
      }>;
    }>("/reports/my-reports");
  }

  // Walk endpoints
  async startWalk(data: {
    mode: "friend" | "guardian" | "safe-place";
    location: { lat: number; lng: number };
    contactIds?: string[];
    guardianIds?: string[];
  }) {
    return this.request<{
      sessionId: string;
      mode: string;
      location: any;
      startedAt: string;
    }>("/walks/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async checkIn(sessionId: string) {
    return this.request<{
      sessionId: string;
      checkInAt: string;
      message: string;
    }>(`/walks/${sessionId}/checkin`, {
      method: "POST",
    });
  }

  async getWalkHistory() {
    return this.request<{
      walks: Array<{
        id: string;
        mode: string;
        startTime: string;
        endTime?: string;
        duration?: string;
        endLocation?: any;
        checkIns: number;
        panicEvents: number;
      }>;
    }>("/walks/history");
  }

  async getGuardianActiveWalks() {
    return this.request<{
      walks: Array<{
        id: string;
        userId: string;
        userName: string;
        mode: string;
        startTime: string;
        startLocation: { lat: number; lng: number };
        currentLocation: { lat: number; lng: number };
        checkIns: number;
        panicEvents: number;
        lastCheckIn: string | null;
      }>;
    }>("/walks/guardian/active");
  }

  async getWalkLocation(sessionId: string) {
    return this.request<{
      sessionId: string;
      userName: string;
      location: { lat: number; lng: number };
      startLocation: { lat: number; lng: number };
      startTime: string;
      checkIns: number;
      panicEvents: number;
      lastCheckIn: string | null;
      lastLocationUpdate: string;
    }>(`/walks/${sessionId}/location`);
  }

  // Notification endpoints
  async getNotifications(unreadOnly?: boolean) {
    const url = unreadOnly ? "/notifications?unreadOnly=true" : "/notifications";
    return this.request<{
      notifications: Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
        metadata?: any;
        createdAt: string;
        readAt?: string;
        walkId?: string;
      }>;
      unreadCount: number;
    }>(url);
  }

  async markNotificationRead(notificationId: string) {
    return this.request<{ id: string; isRead: boolean }>(
      `/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      }
    );
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>("/notifications/read-all", {
      method: "PATCH",
    });
  }

  async updateWalkLocation(sessionId: string, location: { lat: number; lng: number }) {
    return this.request<{
      sessionId: string;
      location: any;
      updatedAt: string;
    }>(`/walks/${sessionId}/location`, {
      method: "POST",
      body: JSON.stringify(location),
    });
  }

  async triggerPanic(sessionId: string, location: { lat: number; lng: number }) {
    return this.request<{
      sessionId: string;
      panicTriggered: boolean;
      timestamp: string;
      message: string;
    }>(`/walks/${sessionId}/panic`, {
      method: "POST",
      body: JSON.stringify({ location }),
    });
  }

  async endWalk(sessionId: string) {
    return this.request<{
      sessionId: string;
      endedAt: string;
      message: string;
    }>(`/walks/${sessionId}/end`, {
      method: "POST",
    });
  }

  // Safe spaces endpoints
  async getNearbySafeSpaces(lat: number, lng: number, radius: number = 5000) {
    return this.request<{
      safeSpaces: Array<{
        id: string;
        name: string;
        type: string;
        location: { lat: number; lng: number };
        address: string;
        isOpen: boolean;
        verified: boolean;
      }>;
    }>(`/safe-spaces/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  // Contact endpoints
  async getContacts(type?: "emergency" | "guardian") {
    const url = type ? `/contacts?type=${type}` : "/contacts";
    return this.request<{ contacts: any[] }>(url);
  }

  async addContact(data: {
    name: string;
    phone: string;
    email?: string;
    type: "emergency" | "guardian";
  }) {
    return this.request<{ contact: any }>("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContact(contactId: string, data: {
    name: string;
    phone: string;
    email?: string;
    type: "emergency" | "guardian";
  }) {
    return this.request<{ contact: any }>(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContact(contactId: string) {
    return this.request<{ message: string; contactId: string }>(
      `/contacts/${contactId}`,
      {
        method: "DELETE",
      }
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
