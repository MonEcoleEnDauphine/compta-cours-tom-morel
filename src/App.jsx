import React, { useState, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, Receipt, HeartHandshake, Plus, 
  FileText, CheckCircle, CreditCard, Download, Presentation,
  ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, BarChart3,
  X, PieChart as PieChartIcon, Calendar, Clock, UserCheck,
  BookOpen, Upload, FileSpreadsheet, Shield
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

const THEME_COLOR = '#0066b3'; 
const THEME_COLOR_LIGHT = '#e6f0f7'; 
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  if (percent < 0.03) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="#ffffff" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-sm font-bold"
      style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Vider toutes les données pour avoir une application 100% vierge
const initialTransactions = [];
const initialFamilies = [];
const initialParents = [];
const initialPeriscolaire = [];
const initialExpenseReports = [];
const initialDonors = [];

const financialStatements = {
  '2025/2026': {
    bilanActif: [],
    bilanPassif: [],
    resultat: []
  }
};

const chartDataYearly = [];
const chartDataTreasury = [];
const chartDataIncome2526 = [];
const chartDataExpenses2526 = [];

const planComptable = [
  { compte: '110000', libelle: 'Report à nouveau', type: 'Capitaux propres' },
  { compte: '120000', libelle: 'Résultat de l\'exercice', type: 'Capitaux propres' },
  { compte: '411000', libelle: 'Créances Clients (Familles)', type: 'Actif circulant' },
  { compte: '512000', libelle: 'Banque Crédit Mutuel', type: 'Trésorerie' },
  { compte: '601000', libelle: 'Achats de livres scolaires', type: 'Charges' },
  { compte: '606100', libelle: 'Energie (Eau, Électricité)', type: 'Charges' },
  { compte: '613200', libelle: 'Locations immobilières (Loyer)', type: 'Charges' },
  { compte: '641100', libelle: 'Salaires brut', type: 'Charges' },
  { compte: '706001', libelle: 'Frais de scolarité', type: 'Produits' },
  { compte: '754000', libelle: 'Dons manuels et mécénat', type: 'Produits' },
];

// DÉFINITION DES ONGLETS ET DE LEURS ACCÈS (RÔLES)
const ALL_TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', roles: ['admin', 'tresorier', 'president', 'benevole'] },
  { id: 'accounting', icon: CreditCard, label: 'Journal & OD', roles: ['admin', 'tresorier'] },
  { id: 'plan', icon: BookOpen, label: 'Plan Comptable', roles: ['admin', 'tresorier'] },
  { id: 'billing', icon: Users, label: 'Familles & Factures', roles: ['admin', 'tresorier'] },
  { id: 'parents', icon: UserCheck, label: 'Suivi Parents', roles: ['admin', 'president'] },
  { id: 'periscolaire', icon: Clock, label: 'Périscolaire 27/28', roles: ['admin', 'president'] },
  { id: 'expenses', icon: Receipt, label: 'Notes de frais', roles: ['admin', 'tresorier', 'president', 'benevole'] },
  { id: 'donors', icon: HeartHandshake, label: 'Dons & Mécénat', roles: ['admin', 'tresorier', 'president'] },
  { id: 'statements', icon: PieChartIcon, label: 'États Financiers', roles: ['admin', 'tresorier'] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // Simulateur de connexion
  
  const [transactions, setTransactions] = useState(initialTransactions);
  const [families, setFamilies] = useState(initialFamilies);
  const [parents, setParents] = useState(initialParents);
  const [periscolaire, setPeriscolaire] = useState(initialPeriscolaire);
  const [expenseReports, setExpenseReports] = useState(initialExpenseReports);
  const [donors, setDonors] = useState(initialDonors);
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [toast, setToast] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ date: '', journal: 'BANQUE', account: '', accountLabel: '', label: '', debit: '', credit: '' });
  
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUserRole(newRole);
    // Si l'onglet actuel n'est pas autorisé pour le nouveau rôle, on renvoie au tableau de bord
    const currentTabInfo = ALL_TABS.find(t => t.id === activeTab);
    if (currentTabInfo && !currentTabInfo.roles.includes(newRole)) {
      setActiveTab('dashboard');
    }
  };

  const handleAddTx = (e) => {
    e.preventDefault();
    const parsedDebit = newTx.debit ? parseFloat(newTx.debit) : null;
    const parsedCredit = newTx.credit ? parseFloat(newTx.credit) : null;
    
    const tx = {
      id: Date.now(),
      date: newTx.date.split('-').reverse().join('/'),
      journal: newTx.journal,
      account: newTx.account,
      accountLabel: newTx.accountLabel,
      label: newTx.label,
      debit: parsedDebit,
      credit: parsedCredit
    };
    
    setTransactions([tx, ...transactions]);
    setShowAddModal(false);
    setNewTx({ date: '', journal: 'BANQUE', account: '', accountLabel: '', label: '', debit: '', credit: '' });
    showToast("Écriture ajoutée avec succès ! (Temporaire avant connexion Google Sheets)");
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '';
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const syncWithGoogleSheets = () => {
    showToast("Simulation : En attente de votre lien API Google Sheets...", "success");
  };

  const totalDons2526 = donors.reduce((sum, d) => sum + d.totalDonated, 0);
  const totalIncome2526 = chartDataIncome2526.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses2526 = chartDataExpenses2526.reduce((sum, item) => sum + item.value, 0);

  // Filtrer les onglets selon le rôle de l'utilisateur
  const visibleTabs = ALL_TABS.filter(tab => tab.roles.includes(userRole));

  const DashboardModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Tableau de bord - Mon Ecole en Dauphiné
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Connecté en tant que : <strong className="text-blue-600 capitalize">{userRole}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200 font-medium">
            <Presentation size={18} /> Mode Présentation AG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 flex flex-col justify-center" style={{borderLeftColor: THEME_COLOR}}>
          <h3 className="text-gray-500 text-sm font-medium">Trésorerie Actuelle</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">0,00 €</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Dons Récoltés <span className="text-xs font-normal">(25/26)</span></h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalDons2526)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Créances Familles</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">0,00 €</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Résultat 25/26</h3>
          <p className="text-2xl font-bold text-gray-600 mt-1">0,00 €</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 justify-center" style={{color: THEME_COLOR}}>
            <HeartHandshake size={20} /> Répartition des Recettes
          </h3>
          {chartDataIncome2526.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-slate-800 mb-6">{formatCurrency(totalIncome2526)}</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataIncome2526} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
                      {chartDataIncome2526.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 h-full">
              <PieChartIcon size={48} className="mb-4 opacity-20" />
              <p>Aucune recette pour le moment</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-lg font-semibold text-red-500 mb-2 flex items-center gap-2 justify-center">
            <PieChartIcon size={20} /> Répartition des Dépenses
          </h3>
          {chartDataExpenses2526.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-slate-800 mb-6">{formatCurrency(totalExpenses2526)}</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataExpenses2526} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
                      {chartDataExpenses2526.map((entry, index) => <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center text-gray-400 h-full">
              <PieChartIcon size={48} className="mb-4 opacity-20" />
              <p>Aucune dépense pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AccountingModule = () => {
    return (
      <div className="space-y-4 h-full flex flex-col pb-8">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Journal de Banque & OD</h2>
            <p className="text-gray-500 text-sm mt-1">Affichage de l'intégralité des écritures</p>
          </div>
          <div className="flex gap-2">
            <button onClick={syncWithGoogleSheets} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 shadow-sm font-medium">
              <FileSpreadsheet size={18} /> Connecter Google Sheets
            </button>
            <input type="file" accept=".txt,.csv" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) showToast(`Fichier ${e.target.files[0].name} importé !`); }} />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm">
              <Upload size={18} /> Importer TXT/CSV
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-sm" style={{backgroundColor: THEME_COLOR}}>
              <Plus size={18} /> Nouvelle Écriture
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Journal</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Compte</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Libellé Pièce</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Débit</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Crédit</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm whitespace-nowrap">{t.date}</td>
                      <td className="p-4 text-sm"><span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">{t.journal}</span></td>
                      <td className="p-4 text-sm font-mono">{t.account}</td>
                      <td className="p-4 text-sm">{t.label}</td>
                      <td className="p-4 text-sm text-right">{t.debit ? formatCurrency(t.debit) : ''}</td>
                      <td className="p-4 text-sm text-right">{t.credit ? formatCurrency(t.credit) : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium text-lg">Le journal est vide.</p>
                      <p className="text-gray-400 text-sm mt-1">Connectez votre Google Sheets ou ajoutez une écriture manuellement.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ChartOfAccountsModule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Plan Comptable</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600 text-sm">N° Compte</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Libellé</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
            </tr>
          </thead>
          <tbody>
            {planComptable.map((acc, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-mono font-bold">{acc.compte}</td>
                <td className="p-4">{acc.libelle}</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">{acc.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ExpensesModule = () => {
    const validateExpense = (id, actionRole) => {
      setExpenseReports(reports => reports.map(r => {
        if (r.id === id) {
          if (actionRole === 'tresorier' && r.status === 'En attente') return { ...r, status: 'Validé (Trésorier)' };
          if (actionRole === 'president' && r.status === 'Validé (Trésorier)') return { ...r, status: 'Validé (Président & Trésorier)' };
        }
        return r;
      }));
      showToast(`Note validée par le ${actionRole === 'tresorier' ? 'Trésorier' : 'Président'}.`);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h2 className="text-2xl font-bold text-gray-800">Notes de Frais & Abandons</h2></div>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg" style={{backgroundColor: THEME_COLOR}}><Plus size={18} /> Saisir Frais</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Nom</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Description</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Montant</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Statut</th>
                {(userRole === 'admin' || userRole === 'tresorier' || userRole === 'president') && (
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Actions de Validation</th>
                )}
              </tr>
            </thead>
            <tbody>
              {expenseReports.length > 0 ? (
                expenseReports.map(frais => (
                  <tr key={frais.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">{frais.name}</td>
                    <td className="p-4 text-sm">{frais.desc}</td>
                    <td className="p-4 font-bold text-right">{formatCurrency(frais.amount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${frais.status.includes('Président') ? 'bg-green-100 text-green-800' : frais.status.includes('Trésorier') ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        {frais.status}
                      </span>
                    </td>
                    {(userRole === 'admin' || userRole === 'tresorier' || userRole === 'president') && (
                      <td className="p-4 flex gap-2 justify-center">
                        {(userRole === 'admin' || userRole === 'tresorier') && (
                          <button onClick={() => validateExpense(frais.id, 'tresorier')} disabled={frais.status !== 'En attente'} className={`px-3 py-1 text-xs rounded border ${frais.status === 'En attente' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
                            Trésorier
                          </button>
                        )}
                        {(userRole === 'admin' || userRole === 'president') && (
                          <button onClick={() => validateExpense(frais.id, 'president')} disabled={frais.status !== 'Validé (Trésorier)'} className={`px-3 py-1 text-xs rounded border ${frais.status === 'Validé (Trésorier)' ? 'border-green-300 text-green-700 bg-green-50' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
                            Président
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Aucune note de frais pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const BillingModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Familles & Facturation</h2></div>
  );
  const ParentsModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Suivi des Parents</h2></div>
  );
  const DonorsModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Dons & Mécénat</h2></div>
  );
  const PeriscolaireModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Suivi Périscolaire</h2></div>
  );
  const FinancialStatementsModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">États Financiers</h2></div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 border-r border-gray-200">
        <div className="p-6 border-b border-gray-100 flex flex-col items-center">
          <img src="bleu fond blanc-2_2.png" alt="Logo" className="w-40 h-auto mb-6 object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/150x80?text=Logo'; }}/>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleTabs.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`} style={activeTab === item.id ? {backgroundColor: THEME_COLOR} : {}}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        {/* SÉLECTEUR DE RÔLE (Simulateur de connexion) */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
            <Shield size={14} /> Sélecteur de rôle
          </label>
          <select value={userRole} onChange={handleRoleChange} className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm">
            <option value="admin">Administrateur (Tout voir)</option>
            <option value="president">Président</option>
            <option value="tresorier">Trésorier</option>
            <option value="benevole">Bénévole / Parent</option>
          </select>
        </div>
      </aside>

      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        <div className="h-full w-full overflow-y-auto p-8">
            {activeTab === 'dashboard' && <DashboardModule />}
            {activeTab === 'accounting' && <AccountingModule />}
            {activeTab === 'plan' && <ChartOfAccountsModule />}
            {activeTab === 'billing' && <BillingModule />}
            {activeTab === 'parents' && <ParentsModule />}
            {activeTab === 'periscolaire' && <PeriscolaireModule />}
            {activeTab === 'expenses' && <ExpensesModule />}
            {activeTab === 'donors' && <DonorsModule />}
            {activeTab === 'statements' && <FinancialStatementsModule />}
        </div>
      </main>

      {}
      {/* Modal d'ajout d'écriture */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Nouvelle Écriture</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTx} className="space-y-4">
              <div><input type="date" required value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full border p-2 text-sm rounded" /></div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="N° Compte" value={newTx.account} onChange={e => setNewTx({...newTx, account: e.target.value})} className="border p-2 text-sm rounded" />
                <input type="text" placeholder="Libellé" value={newTx.label} onChange={e => setNewTx({...newTx, label: e.target.value})} className="border p-2 text-sm rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Débit €" value={newTx.debit} onChange={e => setNewTx({...newTx, debit: e.target.value, credit: ''})} disabled={newTx.credit !== ''} className="border p-2 text-sm rounded" />
                <input type="number" step="0.01" placeholder="Crédit €" value={newTx.credit} onChange={e => setNewTx({...newTx, credit: e.target.value, debit: ''})} disabled={newTx.debit !== ''} className="border p-2 text-sm rounded" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 text-white rounded" style={{backgroundColor: THEME_COLOR}}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {toast && (
        <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-xl z-50">
          <CheckCircle className="text-green-400" size={20} />
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 text-slate-400"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
