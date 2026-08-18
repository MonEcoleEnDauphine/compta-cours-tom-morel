import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, Users, Receipt, PieChart as PieChartIcon,
  Plus, Upload, Search, Filter, FileText, ChevronDown, ChevronRight,
  FolderOpen, Landmark, FileSpreadsheet, Settings, Bell, Paperclip,
  CheckCircle, AlertCircle, Download, FileSignature, Euro, UserPlus,
  Package, ShoppingCart, AlertTriangle, Box,
  Clock, CalendarHeart, ClipboardCheck, Utensils, HeartHandshake, Tent
} from 'lucide-react';

// --- DONNÉES DE DÉMONSTRATION ---
const mockFamilies = [
  { id: 'F001', name: 'Dupont', parents: 'Jean & Marie', children: ['Lucas (CP)', 'Emma (CE2)'], email: 'famille.dupont@email.com', status: 'À jour' },
  { id: 'F002', name: 'Martin', parents: 'Sophie', children: ['Hugo (CM1)'], email: 's.martin@email.com', status: 'Retard' },
  { id: 'F003', name: 'Alziari de Madon', parents: 'M. et Mme', children: ['Arthur (Maternelle)'], email: 'alziari@email.com', status: 'À jour' }
];

const mockStock = [
  { id: 'ART-001', category: 'Uniforme', name: 'Polo de l\'école (Manches courtes)', size: '6-8 ans', quantity: 15, alert: 5, price: 18.00 },
  { id: 'ART-002', category: 'Uniforme', name: 'Pull col V brodé', size: '10-12 ans', quantity: 2, alert: 5, price: 25.00 },
  { id: 'ART-003', category: 'Fournitures', name: 'Cahier d\'écriture ligné spécifique', size: 'Standard', quantity: 45, alert: 20, price: 3.50 },
  { id: 'ART-004', category: 'Manuel', name: 'Livre de lecture syllabique', size: 'CP', quantity: 0, alert: 2, price: 15.00 }
];

const mockTransactions = [
  { id: 1, date: '10/09/2023', journal: 'BANQUE', account: '706000', label: 'Virement Famille Dupont (FAC-001)', debit: 0, credit: 450.00, attachment: true },
  { id: 2, date: '12/09/2023', journal: 'BANQUE', account: '754000', label: 'Donation Alziari de Madon', debit: 0, credit: 1500.00, attachment: false, needsReceipt: true },
  { id: 3, date: '15/09/2023', journal: 'BANQUE', account: '606100', label: 'Facture EDF', debit: 125.50, credit: 0, attachment: true },
  { id: 4, date: '28/09/2023', journal: 'BANQUE', account: '627100', label: 'Frais bancaires Crédit Mutuel', debit: 15.00, credit: 0, attachment: false },
  { id: 5, date: '30/09/2023', journal: 'OD', account: '421000', label: 'Salaires Professeurs Septembre', debit: 3200.00, credit: 0, attachment: true },
];

const mockBudget = [
  { category: 'Pédagogie', allocated: 5000, spent: 1200 },
  { category: 'Locaux (Loyer/Énergie)', allocated: 15000, spent: 3500 },
  { category: 'Salaires & Charges', allocated: 45000, spent: 7500 },
  { category: 'Frais Admin/Banque', allocated: 2000, spent: 300 }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // États pour les menus déroulants de la sidebar
  const [isScolariteOpen, setIsScolariteOpen] = useState(true);
  const [isPeriscolaireOpen, setIsPeriscolaireOpen] = useState(true);
  const [isLogistiqueOpen, setIsLogistiqueOpen] = useState(false);
  const [isProjetsOpen, setIsProjetsOpen] = useState(false);
  const [isRHOpen, setIsRHOpen] = useState(false);
  const [isComptaOpen, setIsComptaOpen] = useState(true);
  const [isSuiviOpen, setIsSuiviOpen] = useState(true);
  
  // États pour les modales
  const [showCerfaModal, setShowCerfaModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getFiscalYear = (dateStr) => {
    if (!dateStr) return "Inconnu";
    const parts = dateStr.split('/');
    if (parts.length !== 3) return "Inconnu";
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (month >= 9) {
      return `${year}/${year + 1}`;
    } else {
      return `${year - 1}/${year}`;
    }
  };

  const DashboardModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord - Vision Globale</h2>
          <p className="text-slate-500">Exercice en cours : 2023/2024</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Nouvelle Opération
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trésorerie Dispo.</h3>
          <p className="text-2xl font-bold text-slate-800">24 342,82 €</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Factures Familles (Encaissées)</h3>
          <p className="text-2xl font-bold text-emerald-600">85%</p>
          <p className="text-xs text-slate-400 mt-1"> Reste 250€ à recouvrer</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-orange-500">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes de frais en attente</h3>
          <p className="text-2xl font-bold text-orange-600">1</p>
          <p className="text-xs text-slate-400 mt-1">À valider avant le 30</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dons & Mécénat</h3>
          <p className="text-2xl font-bold text-purple-600">1 500,00 €</p>
          <p className="text-xs text-slate-400 mt-1">1 Reçu fiscal à émettre</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Suivi du Budget Prévisionnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBudget} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="allocated" name="Budget Alloué" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" name="Dépensé" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Actions Requises</h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="font-medium text-sm">1 Reçu fiscal en attente d'émission</span>
                </div>
                <button onClick={() => setActiveTab('dons')} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 font-bold">Générer</button>
             </div>
             <div className="flex items-center justify-between p-3 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <FileSignature size={20} />
                  <span className="font-medium text-sm">1 Note de frais (Directrice) à valider</span>
                </div>
                <button onClick={() => setActiveTab('ndf')} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-md hover:bg-orange-600 font-bold">Voir</button>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 text-slate-700 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <Paperclip size={20} className="text-slate-400"/>
                  <span className="font-medium text-sm">3 lignes bancaires sans facture rattachée</span>
                </div>
                <button onClick={() => setActiveTab('journal')} className="text-xs bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-300 font-bold">Pointer</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const JournalModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Journal & Rapprochement</h2>
          <p className="text-slate-500">Banque et Opérations Diverses (OD). Rattachez vos justificatifs.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Compte</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3 text-right">Débit</th>
              <th className="px-4 py-3 text-right">Crédit</th>
              <th className="px-4 py-3 text-center">Justificatif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{t.date}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{t.account}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.label}</td>
                <td className="px-4 py-3 text-right text-orange-600 font-medium">{t.debit ? formatCurrency(t.debit) : '-'}</td>
                <td className="px-4 py-3 text-right text-emerald-600 font-medium">{t.credit ? formatCurrency(t.credit) : '-'}</td>
                <td className="px-4 py-3 text-center">
                  {t.attachment ? (
                    <button className="text-emerald-600 flex justify-center w-full"><CheckCircle size={18} /></button>
                  ) : (
                    <button onClick={() => { setSelectedTransaction(t); setShowAttachmentModal(true); }} className="text-slate-400 hover:text-indigo-600 flex justify-center w-full"><Paperclip size={18} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StockModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-indigo-600"/> Stocks & Boutique</h2>
          <p className="text-slate-500">Gérez les uniformes, manuels et fournitures vendus aux familles.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3">Réf</th>
              <th className="px-4 py-3">Désignation</th>
              <th className="px-4 py-3 text-center">En Stock</th>
              <th className="px-4 py-3 text-right">Prix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockStock.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-400 text-xs">{item.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.name} ({item.size})</td>
                <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InscriptionsModule = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6"><ClipboardCheck size={64} className="text-blue-500" /></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Dossiers d'Inscriptions Numériques</h2>
      <p className="text-slate-500 max-w-lg mb-6">Fini le papier ! Les parents remplissent les fiches d'urgence en ligne.</p>
      <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium">Créer la campagne</button>
    </div>
  );

  const PointageModule = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <div className="bg-orange-50 p-6 rounded-full mb-6"><Clock size={64} className="text-orange-500" /></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Pointage Cantine & Garderie</h2>
      <p className="text-slate-500 max-w-lg mb-6">Pointage sur tablette et génération automatique des factures à la fin du mois.</p>
    </div>
  );

  const ProjetsModule = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <div className="bg-purple-50 p-6 rounded-full mb-6"><Tent size={64} className="text-purple-500" /></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Kermesse & Événements</h2>
      <p className="text-slate-500 max-w-lg mb-6">Isolez les finances d'un événement pour calculer sa rentabilité.</p>
    </div>
  );

  const RHModule = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <div className="bg-emerald-50 p-6 rounded-full mb-6"><HeartHandshake size={64} className="text-emerald-500" /></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">RH & Bénévolat</h2>
      <p className="text-slate-500 max-w-lg mb-6">Déclaration des heures bénévoles pour le bilan comptable et suivi RH.</p>
    </div>
  );

  const CerfaModal = () => showCerfaModal ? (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">Édition Reçu Fiscal (Cerfa)</h3>
        <button onClick={() => setShowCerfaModal(false)} className="bg-slate-200 px-4 py-2 rounded">Fermer</button>
      </div>
    </div>
  ) : null;

  const AttachmentModal = () => showAttachmentModal ? (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">Joindre un justificatif</h3>
        <button onClick={() => setShowAttachmentModal(false)} className="bg-slate-200 px-4 py-2 rounded">Fermer</button>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-5 bg-slate-950/50 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">ERP ÉCOLE ASSO</h1>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">Gestion Globale</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          
          <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Général</div>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={18} /> Tableau de bord
          </button>

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsScolariteOpen(!isScolariteOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><BookOpen size={14}/> Scolarité</span>
              {isScolariteOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isScolariteOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('inscriptions')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'inscriptions' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">📝</span> Dossiers Numériques
              </button>
            </div>
          )}

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsPeriscolaireOpen(!isPeriscolaireOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><Utensils size={14}/> Périscolaire</span>
              {isPeriscolaireOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isPeriscolaireOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('pointages')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'pointages' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">⏱️</span> Pointages (Cantine/Gard.)
              </button>
            </div>
          )}

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsLogistiqueOpen(!isLogistiqueOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><Package size={14}/> Logistique & Mat.</span>
              {isLogistiqueOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isLogistiqueOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('stocks')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'stocks' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">📦</span> Stocks (Uniformes)
              </button>
            </div>
          )}

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsProjetsOpen(!isProjetsOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><CalendarHeart size={14}/> Événements</span>
              {isProjetsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isProjetsOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('projets')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'projets' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">🎪</span> Kermesse & Marchés
              </button>
            </div>
          )}

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsRHOpen(!isRHOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><Users size={14}/> Équipe & RH</span>
              {isRHOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isRHOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('rh')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'rh' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">🤝</span> Suivi Bénévolat
              </button>
            </div>
          )}

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsComptaOpen(!isComptaOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><Landmark size={14}/> Comptabilité</span>
              {isComptaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isComptaOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('journal')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'journal' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">🏦</span> Journal & Saisie
              </button>
            </div>
          )}

          <div className="mt-6 px-4 mb-2">
            <button onClick={() => setIsSuiviOpen(!isSuiviOpen)} className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">
              <span className="flex items-center gap-2"><FolderOpen size={14}/> Suivi Administratif</span>
              {isSuiviOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {isSuiviOpen && (
            <div className="space-y-0.5">
              <button onClick={() => setActiveTab('familles')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'familles' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">👨‍👩‍👧‍👦</span> Familles & Factures
              </button>
              <button onClick={() => setActiveTab('dons')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${activeTab === 'dons' ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg leading-none">🎁</span> Reçus Fiscaux
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">🚀 ERP Mode Démo</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardModule />}
          {activeTab === 'journal' && <JournalModule />}
          {activeTab === 'stocks' && <StockModule />}
          {activeTab === 'inscriptions' && <InscriptionsModule />}
          {activeTab === 'pointages' && <PointageModule />}
          {activeTab === 'projets' && <ProjetsModule />}
          {activeTab === 'rh' && <RHModule />}
          {/* Fallback */}
          {['familles', 'dons'].includes(activeTab) && (
             <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
               Ce module fera partie de l'intégration avec la base de données.
             </div>
          )}
        </main>
      </div>
      
      <CerfaModal />
      <AttachmentModal />
    </div>
  );
};

export default App;
