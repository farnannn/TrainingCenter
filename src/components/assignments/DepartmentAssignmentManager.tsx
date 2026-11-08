import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { getRolePermissions, RoleCode, UserProfile } from '../../lib/types';
import { Button } from '../ui/Button';
import {
  Users,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export const DepartmentAssignmentManager: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nik, setNik] = useState('');
  const [roleCode, setRoleCode] = useState<RoleCode>('ADMIN');
  const [deptId, setDeptId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!perms.canManageUsers) {
    return (
      <div className="p-8 bg-white rounded-[12px] border border-[#B94C45]/30 text-center space-y-2">
        <Lock className="w-8 h-8 text-[#B94C45] mx-auto" />
        <h3 className="text-sm font-heading font-bold text-[#18232B]">
          Akses Ditolak (Super Admin Exclusive)
        </h3>
        <p className="text-xs text-[#5A6B75]">
          Hanya role <strong>Super Admin</strong> yang memiliki hak akses ke menu User Management.
        </p>
      </div>
    );
  }

  const users = mockStore.users;
  const roles = mockStore.roles;
  const departments = mockStore.departments;

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setNik('');
    setRoleCode('ADMIN');
    setDeptId(departments[0]?.id || '');
    setError(null);
    setShowAddUserModal(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setFullName(u.full_name);
    setEmail(u.email);
    setNik(u.nik);
    setRoleCode(u.role_code);
    setDeptId(u.department_id || '');
    setError(null);
    setShowAddUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        mockStore.updateUserAccount(currentUser.id, editingUser.id, {
          full_name: fullName,
          email,
          nik,
          role_code: roleCode,
          department_id: deptId || null,
        });
        setSuccess(`Data pengguna ${fullName} berhasil diperbarui.`);
      } else {
        mockStore.createUserAccount(currentUser.id, {
          full_name: fullName,
          email,
          nik,
          role_code: roleCode,
          department_id: deptId || null,
        });
        setSuccess(`Akun pengguna baru ${fullName} (${roleCode}) berhasil ditambahkan.`);
      }
      refreshState();
      setShowAddUserModal(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pengguna.');
    }
  };

  const handleDeleteUser = (u: UserProfile) => {
    if (u.id === currentUser.id) {
      alert('Tidak dapat menghapus akun Super Admin yang sedang aktif.');
      return;
    }
    const ok = window.confirm(`Hapus akun pengguna "${u.full_name}" (${u.role_name})?`);
    if (!ok) return;

    try {
      mockStore.deleteUserAccount(currentUser.id, u.id);
      refreshState();
      setSuccess(`Akun ${u.full_name} berhasil dihapus.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640] flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>User & Role Access Management • Super Admin Only</span>
          </div>
          <h2 className="text-xl font-heading font-bold mt-1">
            Manajemen Akun Pengguna & 6 Role Sistem
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Kelola akun pengguna resmi RAJA ACADEMY berdasarkan 6 Role: Super Admin, Admin, PJO, Manager TC, Admin TC, dan Admin HRGA.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Tambah Pengguna Baru
        </Button>
      </div>

      {success && (
        <div className="p-3.5 bg-[#397C69]/12 border border-[#397C69]/30 rounded-[10px] text-xs text-[#296050] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 6 Official Roles Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => {
          const count = users.filter((u) => u.role_code === r.code && u.is_active).length;
          return (
            <div
              key={r.id}
              className="bg-white p-4 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading font-bold text-sm text-[#18232B]">
                    {r.name}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F4F6F5] text-[#E88932] font-semibold border border-[#E2E8E8]">
                    {r.code}
                  </span>
                </div>
                <p className="text-xs text-[#5A6B75] leading-relaxed">{r.description}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E2E8E8] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#5A6B75]">Level Akses {r.access_level}</span>
                <span className="font-bold text-[#18232B]">{count} Akun Aktif</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex justify-between items-center">
          <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E88932]" />
            <span>Daftar Akun Pengguna Terdaftar ({users.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
              <tr>
                <th className="px-6 py-3">Nama Lengkap & NIK</th>
                <th className="px-6 py-3">Email Login</th>
                <th className="px-6 py-3">Role Fungsional</th>
                <th className="px-6 py-3">Departemen</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {users.map((u) => {
                const dept = departments.find((d) => d.id === u.department_id);
                const roleObj = roles.find((r) => r.code === u.role_code);
                return (
                  <tr key={u.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-heading font-semibold text-[#18232B]">
                        {u.full_name}
                      </div>
                      <div className="text-[11px] font-mono text-[#E88932]">{u.nik}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#263640]">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-heading font-semibold bg-[#18232B] text-white">
                        {roleObj?.name || u.role_code}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#263640]">
                      {dept ? `${dept.code} — ${dept.name}` : 'All Departments (Central)'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => openEditModal(u)}
                        >
                          Edit
                        </Button>
                        {u.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-3.5 h-3.5 text-[#B94C45]" />}
                            onClick={() => handleDeleteUser(u)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <h3 className="text-sm font-heading font-bold">
                {editingUser ? 'Edit Akun Pengguna & Role' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    NIK Pengguna *
                  </label>
                  <input
                    type="text"
                    required
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="NIK-RAJA-01"
                    className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Email Korporat *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@ptraja.com"
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Pilih Role (6 Role Resmi) *
                  </label>
                  <select
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value as RoleCode)}
                    className="w-full h-[38px] px-3 text-xs font-semibold bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.code}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Departemen (Opsional untuk Central)
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                  >
                    <option value="">All Departments (Central)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Simpan Akun Pengguna
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
