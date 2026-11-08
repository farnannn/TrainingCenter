import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingCategoryOption, TrainingTypeOption } from '../../lib/types';
import { Button } from '../ui/Button';
import {
  Tags,
  Layers,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const TrainingCategoryTypeManager: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const isAllowed =
    currentUser.role_code === 'SUPER_ADMIN' || currentUser.role_code === 'ADMIN';

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<TrainingCategoryOption | null>(null);
  const [catCode, setCatCode] = useState('');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  // Training Type Modal State
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<TrainingTypeOption | null>(null);
  const [typeCode, setTypeCode] = useState('');
  const [typeName, setTypeName] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeError, setTypeError] = useState<string | null>(null);

  // Delete Confirmation State
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<TrainingCategoryOption | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<TrainingTypeOption | null>(null);

  // Banner Feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAllowed) {
    return (
      <div className="p-8 bg-white rounded-[12px] border border-[#B94C45]/30 text-center space-y-2">
        <Lock className="w-8 h-8 text-[#B94C45] mx-auto" />
        <h3 className="text-sm font-heading font-bold text-[#18232B]">
          Akses Dibatasi (Khusus Admin & Super Admin)
        </h3>
        <p className="text-xs text-[#5A6B75]">
          Hanya role <strong>Admin</strong> dan <strong>Super Admin</strong> yang dapat menambah, mengedit, atau menghapus Master Category & Training Type.
        </p>
      </div>
    );
  }

  const categories = mockStore.trainingCategories;
  const trainingTypes = mockStore.trainingTypes;

  // Category Handlers
  const openAddCategory = () => {
    setEditingCat(null);
    setCatCode('');
    setCatName('');
    setCatDesc('');
    setCatError(null);
    setShowCatModal(true);
  };

  const openEditCategory = (cat: TrainingCategoryOption) => {
    setEditingCat(cat);
    setCatCode(cat.code);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatError(null);
    setShowCatModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setSuccessMsg(null);
    try {
      if (editingCat) {
        mockStore.updateTrainingCategory(currentUser.id, editingCat.id, {
          code: catCode,
          name: catName,
          description: catDesc,
        });
        setSuccessMsg(`Category "${catName}" berhasil diperbarui.`);
      } else {
        mockStore.addTrainingCategory(currentUser.id, {
          code: catCode,
          name: catName,
          description: catDesc,
        });
        setSuccessMsg(`Category baru "${catName}" berhasil ditambahkan.`);
      }
      refreshState();
      setShowCatModal(false);
    } catch (err: any) {
      setCatError(err.message || 'Gagal menyimpan Category.');
    }
  };

  const executeDeleteCategory = () => {
    if (!confirmDeleteCat) return;
    setSuccessMsg(null);
    try {
      mockStore.deleteTrainingCategory(currentUser.id, confirmDeleteCat.id);
      setSuccessMsg(`Category "${confirmDeleteCat.name}" berhasil dihapus.`);
      setConfirmDeleteCat(null);
      refreshState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Training Type Handlers
  const openAddType = () => {
    setEditingType(null);
    setTypeCode('');
    setTypeName('');
    setTypeDesc('');
    setTypeError(null);
    setShowTypeModal(true);
  };

  const openEditType = (tObj: TrainingTypeOption) => {
    setEditingType(tObj);
    setTypeCode(tObj.code);
    setTypeName(tObj.name);
    setTypeDesc(tObj.description || '');
    setTypeError(null);
    setShowTypeModal(true);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    setTypeError(null);
    setSuccessMsg(null);
    try {
      if (editingType) {
        mockStore.updateTrainingType(currentUser.id, editingType.id, {
          code: typeCode,
          name: typeName,
          description: typeDesc,
        });
        setSuccessMsg(`Training Type "${typeName}" berhasil diperbarui.`);
      } else {
        mockStore.addTrainingType(currentUser.id, {
          code: typeCode,
          name: typeName,
          description: typeDesc,
        });
        setSuccessMsg(`Training Type baru "${typeName}" berhasil ditambahkan.`);
      }
      refreshState();
      setShowTypeModal(false);
    } catch (err: any) {
      setTypeError(err.message || 'Gagal menyimpan Training Type.');
    }
  };

  const executeDeleteType = () => {
    if (!confirmDeleteType) return;
    setSuccessMsg(null);
    try {
      mockStore.deleteTrainingType(currentUser.id, confirmDeleteType.id);
      setSuccessMsg(`Training Type "${confirmDeleteType.name}" berhasil dihapus.`);
      setConfirmDeleteType(null);
      refreshState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640] flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
            <Tags className="w-4 h-4" />
            <span>Master Data Training • Khusus Admin & Super Admin</span>
          </div>
          <h2 className="text-xl font-heading font-bold mt-1">
            Kelola Category & Training Type
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Tambah, edit, atau hapus daftar <strong>Category</strong> dan <strong>Training Type</strong> yang digunakan pada form Input Data Training, Edit Training, serta grafik analitik Training Achievement.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#397C69]/25 border border-[#397C69]/50 text-[#6CD4B4] text-xs font-mono font-semibold">
          <span>Akses Aktif: {currentUser.role_name}</span>
        </span>
      </div>

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

      {/* Two-Column Grid: Left = Category, Right = Training Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. TRAINING CATEGORY CARD */}
        <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-heading font-bold text-[#18232B] flex items-center gap-2">
                <Tags className="w-4 h-4 text-[#E88932]" />
                <span>Master Category ({categories.length})</span>
              </h3>
              <p className="text-[11px] text-[#5A6B75] mt-0.5">
                Kategori kurikulum pelatihan (Safety, Technical, Certification, dll.)
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={openAddCategory}
            >
              Tambah Category
            </Button>
          </div>

          <div className="divide-y divide-[#E2E8E8] flex-1">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A6B75]">
                Belum ada Category training. Silakan klik "Tambah Category".
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F4F6F5]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#18232B] text-white">
                        {cat.code}
                      </span>
                      <span className="text-xs font-heading font-bold text-[#18232B]">
                        {cat.name}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-[#5A6B75] mt-1">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => openEditCategory(cat)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setConfirmDeleteCat(cat)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. TRAINING TYPE CARD */}
        <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-heading font-bold text-[#18232B] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E88932]" />
                <span>Master Training Type ({trainingTypes.length})</span>
              </h3>
              <p className="text-[11px] text-[#5A6B75] mt-0.5">
                Metode / jenis pelaksanaan pelatihan (INTERNAL, EXTERNAL, CERTIFICATION, IN_HOUSE, dll.)
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={openAddType}
            >
              Tambah Training Type
            </Button>
          </div>

          <div className="divide-y divide-[#E2E8E8] flex-1">
            {trainingTypes.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A6B75]">
                Belum ada Training Type. Silakan klik "Tambah Training Type".
              </div>
            ) : (
              trainingTypes.map((tt) => (
                <div
                  key={tt.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F4F6F5]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#E88932]/15 text-[#B86214] border border-[#E88932]/30">
                        {tt.code}
                      </span>
                      <span className="text-xs font-heading font-bold text-[#18232B]">
                        {tt.name}
                      </span>
                    </div>
                    {tt.description && (
                      <p className="text-[11px] text-[#5A6B75] mt-1">{tt.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => openEditType(tt)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setConfirmDeleteType(tt)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL ADD / EDIT CATEGORY */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white flex justify-between items-center">
              <h3 className="text-sm font-heading font-bold">
                {editingCat ? 'Edit Category Training' : 'Tambah Category Training Baru'}
              </h3>
              <button
                onClick={() => setShowCatModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {catError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Kode / Key Category *
                </label>
                <input
                  type="text"
                  required
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  placeholder="Contoh: Safety / Technical / Operational"
                  className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Nama Tampilan Category *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Safety / HSE"
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Deskripsi singkat kategori pelatihan..."
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowCatModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {editingCat ? 'Simpan Perubahan' : 'Tambah Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT TRAINING TYPE */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white flex justify-between items-center">
              <h3 className="text-sm font-heading font-bold">
                {editingType ? 'Edit Training Type' : 'Tambah Training Type Baru'}
              </h3>
              <button
                onClick={() => setShowTypeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveType} className="p-6 space-y-4">
              {typeError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{typeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Kode Training Type *
                </label>
                <input
                  type="text"
                  required
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  placeholder="Contoh: INTERNAL / EXTERNAL / ON_JOB_TRAINING"
                  className="w-full h-[38px] px-3 text-xs font-mono uppercase bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Nama Lengkap Training Type *
                </label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Contoh: Internal Training Center"
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  placeholder="Deskripsi singkat jenis pelaksanaan..."
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowTypeModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {editingType ? 'Simpan Perubahan' : 'Tambah Training Type'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM DELETE CATEGORY */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <h3 className="text-sm font-heading font-bold">Konfirmasi Hapus Category</h3>
              <button
                onClick={() => setConfirmDeleteCat(null)}
                className="text-white/80 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#263640]">
                Hapus Category <strong className="text-[#18232B]">{confirmDeleteCat.name}</strong> (
                <code className="font-mono text-[#E88932]">{confirmDeleteCat.code}</code>) dari sistem?
              </p>
              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDeleteCat(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={executeDeleteCategory}
                >
                  Ya, Hapus Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM DELETE TRAINING TYPE */}
      {confirmDeleteType && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <h3 className="text-sm font-heading font-bold">Konfirmasi Hapus Training Type</h3>
              <button
                onClick={() => setConfirmDeleteType(null)}
                className="text-white/80 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#263640]">
                Hapus Training Type{' '}
                <strong className="text-[#18232B]">{confirmDeleteType.name}</strong> (
                <code className="font-mono text-[#E88932]">{confirmDeleteType.code}</code>) dari sistem?
              </p>
              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDeleteType(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={executeDeleteType}
                >
                  Ya, Hapus Training Type
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
