import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'currentUser';
  currentUser: User | null = null; // ✅ إضافة خاصية لتخزين المستخدم الحالي في الذاكرة

  constructor() {
    // ✅ استرجاع المستخدم من localStorage عند بداية التطبيق
    try {
      const raw = localStorage.getItem(this.key);
      this.currentUser = raw ? (JSON.parse(raw) as User) : null;
    } catch {
      this.currentUser = null;
    }
  }

  login(user: User) {
    try {
      localStorage.setItem(this.key, JSON.stringify(user));
      this.currentUser = user; // ✅ تحديث القيمة في الذاكرة
    } catch {}
  }

  register(user: User) {
    // for this demo, registration is same as login
    this.login(user);
  }

  logout() {
    try {
      localStorage.removeItem(this.key);
      this.currentUser = null; // ✅ مسح القيمة من الذاكرة كمان
    } catch {}
  }
}
