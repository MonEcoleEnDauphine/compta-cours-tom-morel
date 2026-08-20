import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, AlertTriangle, CheckCircle,
  Building, Calendar, CreditCard, PieChart, Shield, Lock, FileText, Upload, 
  Trash2, XCircle, RotateCcw, Search, ChevronRight, CheckCircle2, AlertCircle, Paperclip,
  Plus, Save, Sparkles, Receipt, Heart, FileSpreadsheet
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDhKe4Nl3mUHagW1LKG5GT-tI1bB2-wtnE",
  authDomain: "cours-tom-morel.firebaseapp.com",
  projectId: "cours-tom-morel",
  storageBucket: "cours-tom-morel.firebasestorage.app",
  messagingSenderId: "605446922070",
  appId: "1:605446922070:web:7d81aca59101d76c5a00f7",
  measurementId: "G-XL0L5MG9LK"
};

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/AG8ngQV-LUFlrtg_DNGIEJuJlg8hL-15Ho9x_gUhT4VHh9raUCwwvKpykeuSr41H06U8AJpts-x4aI6LsqQ-JpWIkDZNjppIGTTOrcWJOwBBgLrBmhjzJ5Fp0_HZ9Blj54z7PfJ9gZhWIe3JI5rKc8MN_9PLh0uvn1qSZEx-fcovZvT4iLqqJMLhDYGXI-Bt=w16383";

// ==========================================
// MODULE : JOURNAL DE BANQUE (Import CSV uniquement)
// ==========================================
const JournalBanque = ({ planComptable }) => {
  const [transactions, setTransactions] = useState([]);
  const [lastImportIds, setLastImportIds] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const autoImpute = (libelle, infos, type) => {
    return 'ATTENTE';
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        const newTransactions = [];
        const newIds = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(';');
          if (cols.length >= 7) {
            const dateStr = cols[0].trim();
            const libelle = cols[1].trim();
            const infos = cols[3].trim();
            const typeOp = cols[4].trim();

            const debitStr = cols[5].replace(',', '.').replace(/[^-0-9.]/g, '');
            const creditStr = cols[6].replace(',', '.').replace(/[^-0-9.]/g, '');

            let montant = 0;
            if (debitStr && debitStr !== '') montant = parseFloat(debitStr);
            else if (creditStr && creditStr !== '') montant = parseFloat(creditStr);

            const newId = Date.now() + i;
            newIds.push(newId);

            newTransactions.push({
              id: newId, date: dateStr, type: typeOp, 
              libelle: `${libelle} ${infos ? '(' + infos + ')' : ''}`,
              montant: montant, compte: autoImpute(libelle, infos, typeOp),
              status: 'pending'
            });
          }
        }
        setTransactions([...newTransactions, ...transactions]);
        setLastImportIds(newIds);
        showToast(`${newTransactions.length} opérations importées avec succès !`);
      } catch (err) {
        showToast("Erreur lors de la lecture du fichier CSV.", "error");
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    e.target.value = null;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Journal de Banque
          </h2>
          <p className="text-slate-500 mt-1">Importez vos relevés pour générer les écritures bancaires.</p>
        </div>
        <div className="flex gap-3">
          {lastImportIds.length > 0 && (
            <button onClick={() => setTransactions(transactions.filter(t => !lastImportIds.includes(t.id)))} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              Annuler le dernier import
            </button>
          )}
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm">
            <Upload size={18} /> Importer un relevé (.csv)
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
          <FileText className="text-blue-500 mx-auto mb-4" size={32} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Aucune transaction bancaire</h3>
          <p className="text-slate-500 mb-6">La liste est vide. Importez un fichier pour commencer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Libellé</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4">Compte</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className={t.status === 'validated' ? 'bg-green-50' : ''}>
                    <td className="py-3 px-4">{t.date}</td>
                    <td className="py-3 px-4 truncate max-w-[250px]">{t.libelle}</td>
                    <td className="py-3 px-4 text-right font-bold">{t.montant} €</td>
                <td className="py-3 px-4">
                  <select value={t.compte} onChange={(e) => setTransactions(transactions.map(tr => tr.id === t.id ? {...tr, compte: e.target.value} : tr))} className="p-2 border rounded-md">
                    <option value="ATTENTE">⚠️ À classer manuellement...</option>
                    {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                  </select>
                </td>
                <td className="py-3 px-4 text-center">
                      <button onClick={() => setTransactions(transactions.filter(tr => tr.id !== t.id))} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MODULE : OPERATIONS DIVERSES (Saisie Manuelle)
// ==========================================
const OperationsDiverses = ({ planComptable }) => {
  const [ods, setOds] = useState([]);
  const [formData, setFormData] = useState({ date: '', libelle: '', debit: '', credit: '421000', montant: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.libelle || !formData.montant) return;
    setOds([{ ...formData, id: Date.now() }, ...ods]);
    setFormData({ date: '', libelle: '', debit: '', credit: '421000', montant: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <FileSignature className="text-indigo-600" /> Saisie Opérations Diverses (OD)
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input type="date" required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Libellé de l'écriture</label>
            <input type="text" placeholder="Ex: Ajustement salaire..." required value={formData.libelle} onChange={e=>setFormData({...formData, libelle: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Compte Débit</label>
            <select value={formData.debit} onChange={e=>setFormData({...formData, debit: e.target.value})} className="w-full p-2 border rounded-md text-sm">
              <option value="">Sélectionner...</option>
              {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Montant (€)</label>
            <input type="number" step="0.01" required value={formData.montant} onChange={e=>setFormData({...formData, montant: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
              <Plus size={16}/> Ajouter
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
        {ods.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Aucune Opération Diverse saisie. Remplissez le formulaire ci-dessus.</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Libellé</th>
                <th className="py-3 px-4 text-center">Débit</th>
                <th className="py-3 px-4 text-center">Crédit</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ods.map(od => (
                <tr key={od.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">{od.date}</td>
                  <td className="py-3 px-4">{od.libelle}</td>
                  <td className="py-3 px-4 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{od.debit}</span></td>
                  <td className="py-3 px-4 text-center"><span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs">421000</span></td>
                  <td className="py-3 px-4 text-right font-bold">{parseFloat(od.montant).toFixed(2)} €</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => setOds(ods.filter(o => o.id !== od.id))} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    )}
  </div>
</div>
);
};

// ==========================================
// MODULE : PLAN COMPTABLE
// ==========================================
const PlanComptableManager = ({ planComptable, setPlanComptable }) => {
const [newId, setNewId] = useState('');
const [newLabel, setNewLabel] = useState('');

const handleAdd = (e) => {
e.preventDefault();
if (!newId || !newLabel) return;
if (planComptable.find(c => c.id === newId)) return;
setPlanComptable([...planComptable, { id: newId, label: newLabel }].sort((a, b) => a.id.localeCompare(b.id)));
setNewId('');
setNewLabel('');
};

const removeCompte = (id) => {
setPlanComptable(planComptable.filter(c => c.id !== id));
};

return (
<div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
  <div className="flex items-center gap-3 mb-2">
    <BookOpen className="text-purple-600" size={28} />
    <h2 className="text-2xl font-bold text-slate-800">Plan Comptable de l'Association</h2>
  </div>

  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <h3 className="text-sm font-semibold text-slate-700 mb-4">Ajouter un nouveau compte</h3>
    <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Numéro (ex: 606300)</label>
        <input type="text" required value={newId} onChange={e=>setNewId(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
      </div>
      <div className="flex-[2] min-w-[200px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Libellé (ex: Fournitures scolaires)</label>
        <input type="text" required value={newLabel} onChange={e=>setNewLabel(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
      </div>
      <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-sm flex items-center gap-2 h-[38px] transition-colors">
        <Plus size={16}/> Ajouter
      </button>
    </form>
  </div>

  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
        <tr>
          <th className="py-3 px-4 w-32">Compte</th>
          <th className="py-3 px-4">Libellé</th>
          <th className="py-3 px-4 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {planComptable.length === 0 ? (
          <tr>
            <td colSpan="3" className="p-12 text-center text-slate-500">
              Aucun compte dans le plan comptable. Utilisez le formulaire pour en créer.
            </td>
          </tr>
        ) : (
          planComptable.map((compte) => (
            <tr key={compte.id} className="hover:bg-slate-50">
              <td className="py-3 px-4 font-bold text-slate-700">{compte.id}</td>
              <td className="py-3 px-4">{compte.label}</td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => removeCompte(compte.id)} className="text-red-400 hover:text-red-600 p-2 rounded">
                  <Trash2 size={16}/>
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
);
};

// ==========================================
// MODULE : PLANNINGS D'ENGAGEMENT (Ménage / Garde)
// ==========================================
const PlanningEngagement = ({ type }) => {
  const isMenage = type === 'menage';
  const title = isMenage ? "Ménage du Week-end" : "Garde Cantine / Cour";
  const MainIcon = isMenage ? Sparkles : CheckCircle;

  const [slots, setSlots] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newDate) return;
    const status = newAssignee.trim() === '' ? 'À pourvoir' : 'Confirmé';
    setSlots([...slots, { id: Date.now(), date: newDate, assignee: newAssignee, status }]);
    setNewDate('');
    setNewAssignee('');
  };

  const removeSlot = (id) => setSlots(slots.filter(s => s.id !== id));

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Users className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-slate-800">Plannings d'Engagement</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Dates du créneau</label>
          <input type="text" placeholder="Ex: 12-13 Sept 2026" value={newDate} onChange={e=>setNewDate(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Famille assignée (Optionnel)</label>
          <input type="text" placeholder="Laisser vide = À pourvoir" value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
        </div>
        <button onClick={handleAddSlot} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors flex items-center gap-2 h-[38px]">
          <Plus size={16}/> Ajouter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#1E293B] p-4 flex items-center gap-2">
          <MainIcon className="text-yellow-400" size={20} />
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {slots.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Aucun créneau planifié. Utilisez le formulaire ci-dessus pour ajouter des dates.
            </div>
          ) : (
            slots.map((slot) => (
              <div key={slot.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                <div>
                  <div className="font-bold text-slate-800 text-base">{slot.date}</div>
                  <div className="text-slate-500 text-sm mt-0.5">
                    {slot.assignee ? slot.assignee : 'À pourvoir'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {slot.status === 'Confirmé' ? (
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-600 font-medium rounded-full text-sm border border-slate-200">
                      Confirmé
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 font-medium rounded-full text-sm border border-yellow-200">
                      S'inscrire
                    </span>
                  )}
                  <button onClick={() => removeSlot(slot.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODULE : LISTE GENERIQUE (Pour NDF, Dons, Contrats, etc.)
// ==========================================
const ModuleListDynamique = ({ title, icon, color }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ nom: '', detail: '' });

  // Map des couleurs Tailwind pour forcer le rendu même si non-purgé
  const bgColors = {
    blue: 'bg-blue-50 border-blue-100', textBlue: 'text-blue-900', btnBlue: 'bg-blue-600 hover:bg-blue-700', iconBlue: 'text-blue-600',
    rose: 'bg-rose-50 border-rose-100', textRose: 'text-rose-900', btnRose: 'bg-rose-600 hover:bg-rose-700', iconRose: 'text-rose-600',
    emerald: 'bg-emerald-50 border-emerald-100', textEmerald: 'text-emerald-900', btnEmerald: 'bg-emerald-600 hover:bg-emerald-700', iconEmerald: 'text-emerald-600',
    amber: 'bg-amber-50 border-amber-100', textAmber: 'text-amber-900', btnAmber: 'bg-amber-600 hover:bg-amber-700', iconAmber: 'text-amber-600',
  };

  const getStyle = (type) => {
    if (color === 'rose') return type === 'bg' ? bgColors.rose : type === 'text' ? bgColors.textRose : type === 'btn' ? bgColors.btnRose : bgColors.iconRose;
    if (color === 'emerald') return type === 'bg' ? bgColors.emerald : type === 'text' ? bgColors.textEmerald : type === 'btn' ? bgColors.btnEmerald : bgColors.iconEmerald;
    if (color === 'amber') return type === 'bg' ? bgColors.amber : type === 'text' ? bgColors.textAmber : type === 'btn' ? bgColors.btnAmber : bgColors.iconAmber;
    return type === 'bg' ? bgColors.blue : type === 'text' ? bgColors.textBlue : type === 'btn' ? bgColors.btnBlue : bgColors.iconBlue;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if(!newItem.nom) return;
    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({ nom: '', detail: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div className={`${getStyle('bg')} p-6 rounded-xl border flex items-center gap-4`}>
        <div className={`p-3 bg-white rounded-full ${getStyle('icon')} shadow-sm`}>{icon}</div>
        <div>
          <h2 className={`text-2xl font-bold ${getStyle('text')}`}>{title}</h2>
          <p className="text-slate-600 mt-1 text-sm">Saisissez de nouvelles données dynamiquement ci-dessous.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Nom / Libellé</label>
          <input type="text" required value={newItem.nom} onChange={e=>setNewItem({...newItem, nom: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Détails (Montant, Date, etc.)</label>
          <input type="text" value={newItem.detail} onChange={e=>setNewItem({...newItem, detail: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
        </div>
        <button type="submit" className={`px-4 py-2 ${getStyle('btn')} text-white rounded-md font-medium text-sm h-[38px] transition-colors`}>Ajouter</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[200px]">
        {items.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Aucune donnée pour le moment.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-800">{item.nom}</span>
                  {item.detail && <span className="ml-3 text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.detail}</span>}
                </div>
                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MODULE : TABLEAU DE BORD (DASHBOARD)
// ==========================================
const TableauDeBord = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Vue d'ensemble</h2>
          <p className="text-slate-500 mt-1">Bienvenue sur le centre de pilotage de l'association.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium border border-indigo-100 flex items-center gap-2">
          <Calendar size={18} /> Année Scolaire 2026-2027
        </div>
      </div>

      {/* Cartes d'indicateurs colorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Carte Banque */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl"><Building size={24} className="text-white" /></div>
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded-full"><Plus size={14}/> 2.4%</span>
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Trésorerie Actuelle</p>
          <h3 className="text-3xl font-bold">24 500 €</h3>
        </div>

        {/* Carte Familles */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl"><Users size={24} className="text-white" /></div>
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded-full"><CheckCircle2 size={14}/> À jour</span>
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Familles Inscrites</p>
          <h3 className="text-3xl font-bold">42</h3>
        </div>

        {/* Carte Factures */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg shadow-amber-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl"><Receipt size={24} className="text-white" /></div>
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded-full"><AlertCircle size={14}/> 3 retards</span>
          </div>
          <p className="text-amber-100 text-sm font-medium mb-1">Factures en attente</p>
          <h3 className="text-3xl font-bold">1 250 €</h3>
        </div>

        {/* Carte Engagements */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl"><Sparkles size={24} className="text-white" /></div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Créneaux de garde vides</p>
          <h3 className="text-3xl font-bold">4</h3>
        </div>
      </div>

      {/* Section Raccourcis */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Raccourcis rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-colors flex flex-col items-center justify-center gap-2 text-slate-600">
            <CreditCard className="text-blue-500" /> Saisir la banque
          </button>
          <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-colors flex flex-col items-center justify-center gap-2 text-slate-600">
            <FileSignature className="text-emerald-500" /> Nouvelle NDF
          </button>
          <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-rose-300 transition-colors flex flex-col items-center justify-center gap-2 text-slate-600">
            <Heart className="text-rose-500" /> Saisir un don
          </button>
          <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-amber-300 transition-colors flex flex-col items-center justify-center gap-2 text-slate-600">
            <FileSpreadsheet className="text-amber-500" /> Facturer
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ECRAN DE CONNEXION 
// ==========================================
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@courstommorel.fr');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@courstommorel.fr' && password === 'admin123') {
      onLogin({ email, role: 'admin', name: 'Direction' });
    } else if (email === 'parent@courstommorel.fr' && password === 'parent123') {
      onLogin({ email, role: 'parent', name: 'Famille Dupont' });
    } else {
      setError('Identifiants incorrects.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Logo Cours Tom Morel" className="h-24 mx-auto mb-4 object-contain rounded-lg shadow-sm bg-white" onError={(e)=>{e.target.style.display='none'}}/>
          <h1 className="text-2xl font-bold text-slate-800">Portail Sécurisé</h1>
          <p className="text-slate-500 mt-2">Cours Tom Morel - Saint-Chef</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <XCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse E-mail</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex justify-center items-center gap-2">
            Se connecter <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [planComptable, setPlanComptable] = useState([]);

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => {
      setCurrentUser(user);
      setActiveTab(user.role === 'admin' ? 'journal_banque' : 'infos');
      setActiveTab(user.role === 'admin' ? 'dashboard' : 'infos');
    }} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">

      {/* SIDEBAR NAVIGATION */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 overflow-y-auto">
        <div className="p-6 bg-slate-950/50 flex flex-col items-center border-b border-slate-800 shrink-0">
          <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center p-2 mb-3 shadow-lg">
            <img src={LOGO_URL} alt="Logo" className="max-h-full max-w-full object-contain" onError={(e)=>{e.target.style.display='none'}}/>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">Cours Tom Morel</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">ERP - Version {isAdmin ? 'Admin' : 'Famille'}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">

          <div>
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Espace Famille</h3>
             <ul className="space-y-1">
                <li><button onClick={() => setActiveTab('infos')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'infos' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><AlertCircle size={18} /> Infos & Contact</button></li>
                <li><button onClick={() => setActiveTab('dossiers')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dossiers' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><GraduationCap size={18} /> Scolarité (Dossiers)</button></li>
                <li><button onClick={() => setActiveTab('mes_factures')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'mes_factures' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Receipt size={18} /> Mes Factures</button></li>
             </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Plannings Parents</h3>
             <ul className="space-y-1">
                <li><button onClick={() => setActiveTab('menage')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'menage' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><AlertTriangle size={18} /> Ménage Week-end</button></li>
                <li><button onClick={() => setActiveTab('surveillance')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'surveillance' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><CheckCircle size={18} /> Garde Cantine / Cour</button></li>
             </ul>
          </div>

          {isAdmin && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Pilotage</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={18} /> Tableau de Bord</button></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Comptabilité & Finances</h3>
              <ul className="space-y-1">
                <li><button onClick={() => setActiveTab('journal_banque')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'journal_banque' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><CreditCard size={18} /> Journal de Banque</button></li>
                <li><button onClick={() => setActiveTab('od')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'od' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><FileSignature size={18} /> Opérations Diverses (OD)</button></li>
                <li><button onClick={() => setActiveTab('plan_comptable')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'plan_comptable' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><BookOpen size={18} /> Plan Comptable</button></li>
                <li><button onClick={() => setActiveTab('ndf')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'ndf' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Receipt size={18} /> Notes de Frais</button></li>
                <li><button onClick={() => setActiveTab('dons')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dons' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Heart size={18} /> Dons & Mécénat</button></li>
                <li><button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'budget' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><PieChart size={18} /> Budget Prévisionnel</button></li>
              </ul>
            </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Administration</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('factures_familles')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'factures_familles' ? 'bg-amber-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><FileSpreadsheet size={18} /> Factures Familles</button></li>
                  <li><button onClick={() => setActiveTab('contrats')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'contrats' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Users size={18} /> Équipe (Contrats)</button></li>
                  <li><button onClick={() => setActiveTab('uniformes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'uniformes' ? 'bg-amber-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Shield size={18} /> Uniformes & Stock</button></li>
                </ul>
              </div>
            </>
          )}
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
           <button onClick={() => setCurrentUser(null)} className="w-full py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-300 rounded transition-colors text-sm font-medium flex justify-center items-center gap-2">
             <XCircle size={16}/> Déconnexion
           </button>
        </div>
      </div>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
          {activeTab === 'dashboard' && "Tableau de Bord"}
          {activeTab === 'infos' && "Informations & Contact"}
          {activeTab === 'mes_factures' && "Mes Factures & Paiements"}
          {activeTab === 'journal_banque' && "Rapprochement Bancaire"}
          {activeTab === 'od' && "Opérations Diverses"}
          {activeTab === 'plan_comptable' && "Gestion du Plan Comptable"}
          {activeTab === 'ndf' && "Gestion des Notes de Frais"}
          {activeTab === 'dons' && "Dons & Reçus Fiscaux"}
          {activeTab === 'menage' && "Planning du Ménage"}
              {activeTab === 'surveillance' && "Tour de garde"}
              {activeTab === 'budget' && "Budget Prévisionnel"}
              {activeTab === 'factures_familles' && "Facturation des Familles"}
              {activeTab === 'uniformes' && "Gestion des Uniformes"}
              {activeTab === 'contrats' && "Contrats & Équipe"}
              {activeTab === 'dossiers' && "Dossiers de Scolarité"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <div className="text-sm font-bold text-slate-700">{currentUser.name}</div>
               <div className="text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-emerald-100">Connecté</div>
             </div>
             <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
               {currentUser.name.charAt(0)}
             </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'infos' && (
             <div className="space-y-6">
                <div className="bg-blue-600 rounded-xl p-8 text-white shadow-md">
                   <h2 className="text-3xl font-bold mb-2">Bienvenue sur le portail du Cours Tom Morel</h2>
                   <p className="text-blue-100 text-lg">Retrouvez ici toutes les informations de scolarité et les plannings.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertCircle className="text-blue-600"/> Contactez l'école</h3>
                      <p className="text-slate-600 mb-2"><strong>Email :</strong> monecoleendauphine@gmail.com</p>
                      <p className="text-slate-600 mb-2"><strong>Adresse :</strong> 24 rue de la Chapelle, 38890 Saint Chef</p>
                   </div>
                </div>
             </div>
          )}

      {activeTab === 'dashboard' && <TableauDeBord />}
      {activeTab === 'journal_banque' && <JournalBanque planComptable={planComptable} />}
      {activeTab === 'od' && <OperationsDiverses planComptable={planComptable} />}
      {activeTab === 'plan_comptable' && <PlanComptableManager planComptable={planComptable} setPlanComptable={setPlanComptable} />}

      {activeTab === 'menage' && <PlanningEngagement type="menage" />}
      {activeTab === 'surveillance' && <PlanningEngagement type="surveillance" />}

          {/* Modules dynamiques réintégrés */}
          {activeTab === 'ndf' && <ModuleListDynamique title="Notes de Frais (NDF)" color="emerald" icon={<Receipt size={24}/>} />}
          {activeTab === 'dons' && <ModuleListDynamique title="Dons & Mécénat" color="rose" icon={<Heart size={24}/>} />}
          {activeTab === 'mes_factures' && <ModuleListDynamique title="Mes Factures (Famille)" color="blue" icon={<Receipt size={24}/>} />}
          {activeTab === 'factures_familles' && <ModuleListDynamique title="Suivi Facturation (Admin)" color="amber" icon={<FileSpreadsheet size={24}/>} />}

          {activeTab === 'budget' && <ModuleListDynamique title="Lignes Budgétaires" color="blue" icon={<PieChart size={24}/>} />}
          {activeTab === 'contrats' && <ModuleListDynamique title="Contrats Équipe" color="blue" icon={<Users size={24}/>} />}
          {activeTab === 'uniformes' && <ModuleListDynamique title="Stock d'Uniformes" color="amber" icon={<Shield size={24}/>} />}
          {activeTab === 'dossiers' && <ModuleListDynamique title="Dossiers d'Inscriptions" color="blue" icon={<GraduationCap size={24}/>} />}

        </main>
      </div>
    </div>
  );
}
