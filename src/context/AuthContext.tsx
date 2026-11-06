import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role, Department, Notification } from '../lib/types';
import { mockStore, INITIAL_USERS } from '../lib/mockStore';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  roles: Role[];
  departments: Department[];
  notifications: Notification[];
  unreadCount: number;
  switchUser: (userId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Super Admin for full discovery, but easily switchable
  const [currentUserId, setCurrentUserId] = useState<string>('00000000-0000-0000-0000-000000000001');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshState = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const user = mockStore.users.find((u) => u.id === currentUserId) || mockStore.users[0];
    const dept = mockStore.departments.find((d) => d.id === user.department_id);
    const role = mockStore.roles.find((r) => r.id === user.role_id);

    setCurrentUser({
      ...user,
      department_name: dept?.name,
      role_name: role?.name,
    });

    const userNotifs = mockStore.notifications.filter((n) => n.user_id === user.id);
    setNotifications([...userNotifs]);
  }, [currentUserId, refreshTrigger]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const markNotificationRead = (id: string) => {
    const notif = mockStore.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
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
    refreshState();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers: mockStore.users,
        roles: mockStore.roles,
        departments: mockStore.departments,
        notifications,
        unreadCount,
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
