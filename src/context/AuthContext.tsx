import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role, Department, Notification } from '../lib/types';
import { mockStore, INITIAL_USERS } from '../lib/mockStore';
import { operationTrainerStore } from '../lib/operationTrainerSeedData';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  roles: Role[];
  departments: Department[];
  notifications: Notification[];
  unreadCount: number;
  cloudStatus: 'ONLINE_SYNCED' | 'SYNCING' | 'LOCAL_CACHE';
  lastCloudSyncAt: string | null;
  supabaseProjectRef: string;
  syncVersion?: number;
  login: (email: string, password?: string) => boolean;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_SESSION_KEY = 'raja_academy_auth_session_v1';

function readSavedAuthSession(): { isAuthenticated: boolean; currentUserId: string } {
  if (typeof window !== 'undefined') {
    try {
      const raw =
        window.localStorage?.getItem(AUTH_SESSION_KEY) ||
        window.sessionStorage?.getItem(AUTH_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.isAuthenticated === 'boolean' && parsed.currentUserId) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
  }
  return {
    isAuthenticated: false,
    currentUserId: '00000000-0000-0000-0000-000000000001',
  };
}

function writeSavedAuthSession(isAuthenticated: boolean, currentUserId: string) {
  if (typeof window !== 'undefined') {
    try {
      if (isAuthenticated) {
        const payload = JSON.stringify({ isAuthenticated: true, currentUserId });
        window.localStorage?.setItem(AUTH_SESSION_KEY, payload);
        window.sessionStorage?.setItem(AUTH_SESSION_KEY, payload);
      } else {
        window.localStorage?.removeItem(AUTH_SESSION_KEY);
        window.sessionStorage?.removeItem(AUTH_SESSION_KEY);
        window.localStorage?.removeItem('raja_academy_active_tab_v1');
      }
    } catch {
      // Ignore
    }
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Visitors in a fresh session see the public company profile first; active sessions survive F5 refresh!
  const initialSession = readSavedAuthSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialSession.isAuthenticated);
  const [currentUserId, setCurrentUserId] = useState<string>(initialSession.currentUserId);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cloudStatus, setCloudStatus] = useState<'ONLINE_SYNCED' | 'SYNCING' | 'LOCAL_CACHE'>(
    mockStore.cloudStatus
  );
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState<string | null>(
    mockStore.lastCloudSyncAt
  );

  const refreshState = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Subscribe to mockStore & operationTrainerStore cloud sync changes and initialize Supabase Online sync on mount
  useEffect(() => {
    const unsubscribeMock = mockStore.subscribe(() => {
      setCloudStatus(mockStore.cloudStatus);
      setLastCloudSyncAt(mockStore.lastCloudSyncAt);
      setRefreshTrigger((prev) => prev + 1);
    });
    const unsubscribeOp = operationTrainerStore.subscribe(() => {
      setRefreshTrigger((prev) => prev + 1);
    });

    mockStore.initCloudSync();

    return () => {
      unsubscribeMock();
      unsubscribeOp();
    };
  }, []);

  useEffect(() => {
    const user = mockStore.users.find((u) => u.id === currentUserId) || mockStore.users[0];
    const dept = mockStore.departments.find((d) => d.id === user.department_id);
    const role = mockStore.roles.find((r) => r.id === user.role_id);

    setCurrentUser({
      ...user,
      department_name: dept?.name,
      role_name: role?.name,
    });

    if (isAuthenticated) {
      const userNotifs = mockStore.notifications.filter((n) => n.user_id === user.id);
      setNotifications([...userNotifs]);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, currentUserId, refreshTrigger]);

  const login = (email: string, _password?: string): boolean => {
    const user = mockStore.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.is_active
    );
    if (user) {
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      writeSavedAuthSession(true, user.id);
      refreshState();
      return true;
    }
    return false;
  };

  const loginAsUser = (userId: string) => {
    const user = mockStore.users.find((u) => u.id === userId && u.is_active);
    if (user) {
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      writeSavedAuthSession(true, user.id);
      refreshState();
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    writeSavedAuthSession(false, currentUserId);
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    if (isAuthenticated) {
      writeSavedAuthSession(true, userId);
    }
  };

  const markNotificationRead = (id: string) => {
    const notif = mockStore.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
      mockStore.persistState();
      refreshState();
    }
  };

  const markAllNotificationsRead = () => {
    mockStore.notifications
      .filter((n) => n.user_id === currentUser.id && !n.is_read)
      .forEach((n) => {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      });
    mockStore.persistState();
    refreshState();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        availableUsers: mockStore.users,
        roles: mockStore.roles,
        departments: mockStore.departments,
        notifications,
        unreadCount,
        cloudStatus,
        lastCloudSyncAt,
        supabaseProjectRef: mockStore.supabaseProjectRef,
        syncVersion: refreshTrigger,
        login,
        loginAsUser,
        logout,
        switchUser,
        markNotificationRead,
        markAllNotificationsRead,
        refreshState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
