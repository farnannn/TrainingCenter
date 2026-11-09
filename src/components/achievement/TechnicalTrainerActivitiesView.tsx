import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import {
  TrainerActivityItem,
  TrainerActivitySection,
  getRolePermissions,
} from '../../lib/types';
import { Button } from '../ui/Button';
import {
  ClipboardList,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const TechnicalTrainerActivitiesView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit = perms.canEditData || perms.canInputData;

  const sections = mockStore.trainerActivities;

  // Inline / Modal State for Editing Section Header
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionBadgeInput, setSectionBadgeInput] = useState('TRAINING');
  const [sectionTitleInput, setSectionTitleInput] = useState('');

  // Inline State for Editing a Specific Activity Item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemSectionId, setEditingItemSectionId] = useState<string | null>(null);
  const [editingItemContent, setEditingItemContent] = useState('');

  // State for Adding a New Activity Item to a Section
  const [addingToSectionId, setAddingToSectionId] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState('');

  // Modal State for Adding a New Section
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSecBadge, setNewSecBadge] = useState('TRAINING');
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecFirstItem, setNewSecFirstItem] = useState('');

  // Feedback Banner
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const startEditSection = (sec: TrainerActivitySection) => {
    setEditingSectionId(sec.id);
    setSectionBadgeInput(sec.badge_label || 'TRAINING');
    setSectionTitleInput(sec.title);
    setErrorMsg(null);
  };

  const handleSaveSectionHeader = (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      mockStore.updateTrainerActivitySection(currentUser.id, sectionId, {
        badge_label: sectionBadgeInput,
        title: sectionTitleInput,
      });
      setEditingSectionId(null);
      setSuccessMsg('Judul bagian aktivitas berhasil diperbarui.');
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui judul bagian.');
    }
  };

  const handleDeleteSection = (sec: TrainerActivitySection) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      mockStore.deleteTrainerActivitySection(currentUser.id, sec.id);
      setSuccessMsg(`Bagian "${sec.title}" berhasil dihapus.`);
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus bagian aktivitas.');
    }
  };

  const startEditItem = (sectionId: string, item: TrainerActivityItem) => {
    setEditingItemSectionId(sectionId);
    setEditingItemId(item.id);
    setEditingItemContent(item.content);
    setErrorMsg(null);
  };

  const handleSaveItem = (e: React.FormEvent, sectionId: string, itemId: string) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      mockStore.updateTrainerActivityItem(
        currentUser.id,
        sectionId,
        itemId,
        editingItemContent
      );
      setEditingItemId(null);
      setEditingItemSectionId(null);
      setSuccessMsg('Poin aktivitas berhasil diperbarui.');
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan poin aktivitas.');
    }
  };

  const handleAddItem = (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      mockStore.addTrainerActivityItem(currentUser.id, sectionId, newItemContent);
      setNewItemContent('');
      setAddingToSectionId(null);
      setSuccessMsg('Poin aktivitas baru berhasil ditambahkan.');
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan poin aktivitas.');
    }
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      mockStore.deleteTrainerActivityItem(currentUser.id, sectionId, itemId);
      setSuccessMsg('Poin aktivitas berhasil dihapus.');
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus poin aktivitas.');
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const initialLines = newSecFirstItem
        .split(/\r?\n/)
        .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(Boolean);

      mockStore.addTrainerActivitySection(currentUser.id, {
        badge_label: newSecBadge,
        title: newSecTitle,
        items: initialLines,
      });
      setNewSecBadge('TRAINING');
      setNewSecTitle('');
      setNewSecFirstItem('');
      setShowAddSectionModal(false);
      setSuccessMsg(`Bagian "${newSecTitle}" berhasil ditambahkan.`);
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambah bagian aktivitas.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640] flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>RAJA ACADEMY • TRAINING ACHIEVEMENT SUB-MENU</span>
          </div>
          <h2 className="text-xl font-heading font-bold mt-1">
            Activitas Technical Trainer & Laporan Kegiatan
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Rincian aktivitas pelaksanaan Training Class, Interview, Assessment, Monitoring OJT Siswa BMC, serta Sharing Session di seluruh Site operasional PT. Roda Jaya Sakti.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#397C69]/25 border border-[#397C69]/50 text-[#6CD4B4] text-xs font-mono font-semibold">
                <span>Mode Akses: EDIT ({currentUser.role_name})</span>
              </span>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setNewSecBadge('TRAINING');
                  setNewSecTitle(`${sections.length + 1}. Activitas Technical Trainer`);
                  setNewSecFirstItem('');
                  setShowAddSectionModal(true);
                }}
              >
                Tambah Bagian Aktivitas
              </Button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#263640] border border-slate-700 text-slate-300 text-xs font-mono font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Mode Akses: LIHAT SAJA ({currentUser.role_name})</span>
            </span>
          )}
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[10px] text-xs text-[#B94C45] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-[#B94C45] hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-[#397C69]/12 border border-[#397C69]/30 rounded-[10px] text-xs text-[#296050] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-[#5A6B75] hover:text-[#18232B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Activity Sections List */}
      <div className="space-y-6">
        {sections.map((sec) => {
          const isEditingHeader = editingSectionId === sec.id;
          const isAddingItem = addingToSectionId === sec.id;

          return (
            <div
              key={sec.id}
              className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden"
            >
              {/* Ribbon Header matching the reference layout: [TRAINING] | [1. Activitas Technical Trainer] */}
              <div className="bg-[#F9E6DE] border-b border-[#E5C7B8] flex flex-wrap items-stretch justify-between">
                {isEditingHeader ? (
                  <form
                    onSubmit={(e) => handleSaveSectionHeader(e, sec.id)}
                    className="w-full p-3 flex flex-wrap items-center gap-2.5 bg-[#FFF8F5]"
                  >
                    <input
                      type="text"
                      value={sectionBadgeInput}
                      onChange={(e) => setSectionBadgeInput(e.target.value)}
                      placeholder="TRAINING"
                      className="w-32 h-[36px] px-3 text-xs font-heading font-bold uppercase bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
                    />
                    <input
                      type="text"
                      required
                      value={sectionTitleInput}
                      onChange={(e) => setSectionTitleInput(e.target.value)}
                      placeholder="Contoh: 1. Activitas Technical Trainer"
                      className="flex-1 min-w-[220px] h-[36px] px-3 text-xs font-heading font-bold bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<Save className="w-3.5 h-3.5" />}
                    >
                      Simpan Judul
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSectionId(null)}
                    >
                      Batal
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-stretch flex-1 min-w-[260px]">
                      {/* Left angled/styled TRAINING badge */}
                      <div
                        className="bg-[#F5E8C7] text-[#18232B] px-5 py-3 font-heading font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center border-r border-[#DEC99A] shadow-2xs"
                        style={{
                          clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)',
                          paddingRight: '1.75rem',
                        }}
                      >
                        {sec.badge_label || 'TRAINING'}
                      </div>

                      {/* Center Title */}
                      <div className="flex-1 px-4 py-3 flex items-center justify-center sm:justify-start">
                        <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
                          {sec.title}
                        </h3>
                      </div>
                    </div>

                    {/* Action Buttons on Header */}
                    {canEdit && (
                      <div className="px-4 py-2.5 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5 text-[#E88932]" />}
                          onClick={() => {
                            setAddingToSectionId(sec.id);
                            setNewItemContent('');
                          }}
                        >
                          Tambah Poin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => startEditSection(sec)}
                        >
                          Edit Judul
                        </Button>
                        {sections.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => handleDeleteSection(sec)}
                          >
                            Hapus Bagian
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Body Area with Warm Rounded Container like the reference image */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF3DD]/60 to-[#EBF0F2]/60">
                <div className="bg-[#F6B092]/35 border-2 border-[#E08A66]/60 rounded-[20px] p-5 sm:p-6 shadow-xs space-y-3">
                  {sec.items.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#5A6B75]">
                      Belum ada poin aktivitas pada bagian ini.{' '}
                      {canEdit && 'Klik tombol "Tambah Poin" untuk menambahkan aktivitas.'}
                    </div>
                  ) : (
                    <ol className="space-y-2.5">
                      {sec.items.map((item, idx) => {
                        const isEditingThisItem =
                          editingItemSectionId === sec.id && editingItemId === item.id;

                        return (
                          <li
                            key={item.id}
                            className="bg-white/85 hover:bg-white transition-colors rounded-[12px] px-4 py-3 border border-[#E08A66]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            {isEditingThisItem ? (
                              <form
                                onSubmit={(e) => handleSaveItem(e, sec.id, item.id)}
                                className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                              >
                                <span className="font-mono font-bold text-xs text-[#C66B1A] shrink-0">
                                  {idx + 1}.
                                </span>
                                <input
                                  type="text"
                                  required
                                  value={editingItemContent}
                                  onChange={(e) => setEditingItemContent(e.target.value)}
                                  className="flex-1 h-[38px] px-3 text-xs sm:text-sm bg-white border border-[#E88932] rounded-[8px] focus:outline-none text-[#18232B]"
                                />
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    icon={<Save className="w-3.5 h-3.5" />}
                                  >
                                    Simpan
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingItemId(null);
                                      setEditingItemSectionId(null);
                                    }}
                                  >
                                    Batal
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-start gap-3 text-xs sm:text-sm text-[#18232B] leading-relaxed">
                                  <span className="font-mono font-bold text-[#18232B] shrink-0 mt-0.5">
                                    {idx + 1}.
                                  </span>
                                  <span className="font-medium">{item.content}</span>
                                </div>

                                {canEdit && (
                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      icon={<Edit3 className="w-3.5 h-3.5" />}
                                      onClick={() => startEditItem(sec.id, item)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="danger"
                                      size="sm"
                                      icon={<Trash2 className="w-3.5 h-3.5" />}
                                      onClick={() => handleDeleteItem(sec.id, item.id)}
                                    >
                                      Hapus
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {/* Form Tambah Poin Aktivitas Baru */}
                  {canEdit && isAddingItem && (
                    <form
                      onSubmit={(e) => handleAddItem(e, sec.id)}
                      className="mt-4 pt-3 border-t border-[#E08A66]/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                    >
                      <span className="font-mono font-bold text-xs text-[#18232B] shrink-0">
                        {sec.items.length + 1}.
                      </span>
                      <input
                        type="text"
                        required
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        placeholder="Ketik poin aktivitas Technical Trainer baru..."
                        className="flex-1 h-[38px] px-3 text-xs sm:text-sm bg-white border border-[#E88932] rounded-[8px] focus:outline-none text-[#18232B]"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Simpan Poin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddingToSectionId(null);
                            setNewItemContent('');
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  )}

                  {canEdit && !isAddingItem && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToSectionId(sec.id);
                          setNewItemContent('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#18232B] hover:text-[#C66B1A] bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-[8px] border border-[#E08A66]/50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E88932]" />
                        <span>Tambah Poin Aktivitas Baru</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#5A6B75] px-1">
                  <span>Total Aktivitas Tercatat: {sec.items.length} Poin</span>
                  <span>
                    Terakhir diperbarui oleh: {sec.updated_by || 'Admin'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Bagian Aktivitas Baru */}
      {showAddSectionModal && canEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#E88932]" />
                <h3 className="text-sm font-heading font-bold">
                  Tambah Bagian Aktivitas Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Label Ribbon *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSecBadge}
                    onChange={(e) => setNewSecBadge(e.target.value)}
                    placeholder="TRAINING"
                    className="w-full h-[38px] px-3 text-xs font-mono uppercase bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Judul Bagian Aktivitas *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSecTitle}
                    onChange={(e) => setNewSecTitle(e.target.value)}
                    placeholder="Contoh: 2. Activitas Technical Trainer"
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Daftar Poin Aktivitas Awal (1 poin per baris)
                </label>
                <textarea
                  rows={5}
                  value={newSecFirstItem}
                  onChange={(e) => setNewSecFirstItem(e.target.value)}
                  placeholder={`Ketik 1 poin per baris:\nMelakukan Training Class dalam pemenuhan competency...\nMelakukan interview bagi candidate mekanik...`}
                  className="w-full text-xs p-3 bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932] text-[#18232B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddSectionModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Tambah Bagian
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
