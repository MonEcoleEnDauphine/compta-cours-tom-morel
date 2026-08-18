import React, { useState, useEffect } from 'react';
// Importation rigoureuse de TOUTES les icônes utilisées
import { 
  LayoutDashboard, BookOpen, Utensils, Landmark, FolderOpen, 
  Users, FileSignature, Bell, ShieldAlert, GraduationCap, 
  MapPin, Mail, ChevronDown, ChevronRight, AlertTriangle, 
  CalendarHeart, CheckCircle, PieChart, ClipboardCheck,
  PackageSearch, Tent, UsersRound, Settings
} from 'lucide-react';

// Importation des graphiques
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar 
} from 'recharts';

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/AG8ngQV-LUFlrtg_DNGIEJuJlg8hL-15Ho9x_gUhT4VHh9raUCwwvKpykeuSr41H06U8AJpts-x4aI6LsqQ-JpWIkDZNjppIGTTOrcWJOwBBgLrBmhjzJ5Fp0_HZ9Blj54z7PfJ9gZhWIe3JI5rKc8MN_9PLh0uvn1qSZEx-fcovZvT4iLqqJMLhDYGXI-Bt=w16383"; 

const mockTransactions = [
  { id: 1, date: '10/09/2026', journal: 'BANQUE', account: '706000', label: 'Scolarité Septembre', debit: 0, credit: 450.00, attachment: true },
  { id: 2, date: '12/09/2026', journal: 'BANQUE', account: '754000', label: 'Dons de soutien (Site Web)', debit: 0, credit: 150.00, attachment: false },
  { id: 3, date: '15/09/2026', journal: 'BANQUE', account: '606300', label: 'Fournitures scolaires (GS à CM2)', debit: 135.00, credit: 0, attachment: true },
  { id: 4, date: '28/09/2026', journal: 'BANQUE', account: '512000', label: 'Virement L. Gérard', debit: 392.72, credit: 0, attachment: false },
];

const mockBudget = [
  { category: 'Pédagogie (GS-CM2)', allocated: 4000, spent: 1200 },
  { category: 'Locaux (St-Chef)', allocated: 12000, spent: 3500 },
  { category: 'Intervenants (Théâtre)', allocated: 3000, spent: 500 },
  { category: 'Admin/Banque', allocated: 1500, spent: 300 }
];

const App = () => {
  const [currentRole, setCurrentRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // États d'ouverture des menus de la barre latérale
  const [isScolariteOpen, setIsScolariteOpen] = useState(false);
  const [isPeriscolaireOpen, setIsPeriscolaireOpen] = useState(false);
  const [isLogistiqueOpen, setIsLogistiqueOpen] = useState(false);
  const [isEvenementsOpen, setIsEvenementsOpen] = useState(false);
  const [isRhOpen, setIsRhOpen] = useState(false);
  const [isComptaOpen, setIsComptaOpen] = useState(false);
  const [isSuiviOpen, setIsSuiviOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const DashboardModule = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord - Rentrée 2026</h2>
          <p className="text-slate-500 mt-1">Vision globale de l'Association Mon école en Dauphiné.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <MapPin size={16} className="text-blue-500" />
            <span>24 rue de la Chapelle, St-Chef</span>
          </div>
        </div>
      </div>
      
      {['admin', 'president'].includes(currentRole) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trésorerie Actuelle</h3>
            <p className="text-2xl font-bold text-slate-800">18 450,00 €</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scolarité (Recouvrement)</h3>
            <p className="text-2xl font-bold text-emerald-600">92%</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dons & Mécénat</h3>
            <p className="text-2xl font-bold text-purple-600">2 150,00 €</p>
          </div>
        </div>
      )}

      {['direction', 'admin', 'president'].includes(currentRole) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Suivi du Budget Prévisionnel</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBudget} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={110} fontSize={11} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="allocated" name="Budget Alloué" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" name="Dépensé" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const FinancialStatementsModule = () => {
    const totalCharges = mockTransactions.filter(t => t.account && t.account.startsWith('6')).reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalProduits = mockTransactions.filter(t => t.account && t.account.startsWith('7')).reduce((sum, t) => sum + (t.credit || 0), 0);
    const resultat = totalProduits - totalCharges;
    const isBenefice = resultat >= 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <PieChart className="text-blue-600"/> États Financiers
        </h2>
        
        {/* BILAN SIMPLIFIÉ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-700 text-white text-center py-2 font-bold text-sm tracking-wider">
            BILAN (Aperçu)
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 border-r border-slate-200">
              <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 text-xs border-b border-blue-100">ACTIF (Banque 512)</div>
              <div className="p-4"><span className="text-slate-800 font-bold text-xl">18 450,00 €</span></div>
            </div>
            <div className="flex-1">
              <div className="bg-purple-50 text-purple-700 font-bold px-4 py-2 text-xs border-b border-purple-100">PASSIF (Résultat & Réserves)</div>
              <div className="p-4"><span className="text-slate-800 font-bold text-xl">18 450,00 €</span></div>
            </div>
          </div>
        </div>

        {/* COMPTE DE RÉSULTAT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white text-center py-2 font-bold text-sm tracking-wider">
            COMPTE DE RÉSULTAT
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 border-r border-slate-200 p-4">
               <h3 className="text-red-700 font-bold text-xs uppercase mb-2">Total Charges</h3>
               <p className="text-xl font-bold text-slate-800">{formatCurrency(totalCharges)}</p>
            </div>
            <div className="flex-1 p-4">
               <h3 className="text-emerald-700 font-bold text-xs uppercase mb-2">Total Produits</h3>
               <p className="text-xl font-bold text-slate-800">{formatCurrency(totalProduits)}</p>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
            <span className="font-bold text-slate-800">RÉSULTAT NET</span>
            <span className={`font-bold text-xl ${isBenefice ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(resultat)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const GenericPlaceholder = ({ icon, title, desc, color }) => (
    <div className={`flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border border-dashed border-${color}-300 p-8 text-center`}>
      <div className={`bg-${color}-50 p-6 rounded-full mb-6`}>{icon}</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">{title}</h2>
      <p className="text-slate-500 max-w-lg mb-6">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 overflow-y-auto">
        <div className="p-5 bg-slate-950/50 border-b border-slate-800 flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-10 w-10 rounded-full object-cover bg-white" />
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">COURS TOM MOREL</h1>
            <p className="text-[9px] text-indigo-300 uppercase tracking-widest font-semibold">Assoc. Mon École en Dauphiné</p>
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={18} /> Tableau de bord
          </button>

          {/* SCOLARITÉ */}
          {['admin', 'direction', 'parent'].includes(currentRole) && (
            <div className="mt-2">
              <button onClick={() => setIsScolariteOpen(!isScolariteOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
                <span className="flex items-center gap-2"><BookOpen size={14}/> Scolarité</span>
                {isScolariteOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isScolariteOpen && (
                <button onClick={() => setActiveTab('dossiers')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'dossiers' ? 'text-blue-400' : 'hover:text-white'}`}>
                  📝 Dossiers (GS-CM2)
                </button>
              )}
            </div>
          )}

          {/* COMPTABILITÉ */}
          {['admin', 'president'].includes(currentRole) && (
            <div className="mt-2">
              <button onClick={() => setIsComptaOpen(!isComptaOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
                <span className="flex items-center gap-2"><Landmark size={14}/> Comptabilité</span>
                {isComptaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isComptaOpen && (
                <>
                  <button onClick={() => setActiveTab('journal')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'journal' ? 'text-blue-400' : 'hover:text-white'}`}>
                    🏦 Journal & OD
                  </button>
                  <button onClick={() => setActiveTab('etatsFinanciers')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'etatsFinanciers' ? 'text-blue-400' : 'hover:text-white'}`}>
                    📊 États Financiers
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* SUIVI ADMINISTRATIF */}
          {['admin', 'direction'].includes(currentRole) && (
            <div className="mt-2">
              <button onClick={() => setIsSuiviOpen(!isSuiviOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
                <span className="flex items-center gap-2"><FolderOpen size={14}/> Suivi Administratif</span>
                {isSuiviOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isSuiviOpen && (
                <>
                  <button onClick={() => setActiveTab('familles')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'familles' ? 'text-blue-400' : 'hover:text-white'}`}>
                    👨‍👩‍👧‍👦 Familles & Factures
                  </button>
                  <button onClick={() => setActiveTab('dons')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'dons' ? 'text-blue-400' : 'hover:text-white'}`}>
                    📜 Reçus Fiscaux
                  </button>
                </>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md flex items-center gap-2">
               <Settings size={14} /> Vue :
             </span>
             <select 
                value={currentRole}
                onChange={(e) => { setCurrentRole(e.target.value); setActiveTab('dashboard'); }}
                className="text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-3 py-1.5 outline-none cursor-pointer"
             >
                <option value="admin">Administrateur Total</option>
                <option value="president">Président / Trésorier</option>
                <option value="direction">Direction (L. Gérard)</option>
                <option value="parent">Parent d'élève</option>
             </select>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardModule />}
          {activeTab === 'etatsFinanciers' && <FinancialStatementsModule />}
          {activeTab === 'journal' && <GenericPlaceholder icon={<Landmark size={48} className="text-slate-500"/>} title="Journal Comptable" desc="Saisie des écritures avec Firebase" color="slate"/>}
          {activeTab === 'dossiers' && <GenericPlaceholder icon={<BookOpen size={48} className="text-blue-500"/>} title="Dossiers Scolaires" desc="Gestion GS au CM2" color="blue"/>}
          {activeTab === 'familles' && <GenericPlaceholder icon={<Users size={48} className="text-purple-500"/>} title="Familles" desc="Base de données" color="purple"/>}
        </main>
      </div>
    </div>
  );
};

export default App;
