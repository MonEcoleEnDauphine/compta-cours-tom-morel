import React, { useState } from 'react';
// Importation des icônes
import { 
  LayoutDashboard, BookOpen, Utensils, Landmark, FolderOpen, 
  Users, FileSignature, ShieldAlert, GraduationCap, 
  MapPin, ChevronDown, ChevronRight, AlertTriangle, 
  CalendarHeart, CheckCircle, PieChart, PackageSearch, 
  Tent, UsersRound, Settings, Shirt, Sparkles, Clock, 
  CalendarRange, Euro, Plus, Shield, Briefcase, Receipt, 
  Gift, Info, LogOut, Lock
} from 'lucide-react';

import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar 
} from 'recharts';

// TON LOGO OFFICIEL
const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/AG8ngQV-LUFlrtg_DNGIEJuJlg8hL-15Ho9x_gUhT4VHh9raUCwwvKpykeuSr41H06U8AJpts-x4aI6LsqQ-JpWIkDZNjppIGTTOrcWJOwBBgLrBmhjzJ5Fp0_HZ9Blj54z7PfJ9gZhWIe3JI5rKc8MN_9PLh0uvn1qSZEx-fcovZvT4iLqqJMLhDYGXI-Bt=w16383"; 

// TA CONFIGURATION FIREBASE OFFICIELLE !
const firebaseConfig = {
  apiKey: "AIzaSyDhKe4Nl3mUHagW1LKG5GT-tI1bB2-wtnE",
  authDomain: "cours-tom-morel.firebaseapp.com",
  projectId: "cours-tom-morel",
  storageBucket: "cours-tom-morel.firebasestorage.app",
  messagingSenderId: "605446922070",
  appId: "1:605446922070:web:7d81aca59101d76c5a00f7",
  measurementId: "G-XL0L5MG9LK"
};

// --- FAUSSES DONNÉES DE DÉMONSTRATION ---
const mockTransactions = [
  { id: 1, date: '10/09/2026', journal: 'BANQUE', account: '706000', label: 'Scolarité Septembre', debit: 0, credit: 450.00, attachment: true },
  { id: 2, date: '15/09/2026', journal: 'BANQUE', account: '606300', label: 'Fournitures scolaires', debit: 135.00, credit: 0, attachment: true },
];

const mockBudget = [
  { category: 'Pédagogie', allocated: 4000, spent: 1200 },
  { category: 'Locaux', allocated: 12000, spent: 3500 },
];

const mockUniformes = [
  { id: 1, item: 'Polo Bleu Marine - Taille 6 ans', stock: 15, alert: false },
  { id: 2, item: 'Sweat à capuche - Taille 8 ans', stock: 2, alert: true },
];

const mockPlanningMenage = [
  { id: 1, date: '12-13 Sept 2026', family: 'Famille Dupont', status: 'Confirmé' },
  { id: 2, date: '19-20 Sept 2026', family: 'À pourvoir', status: 'Urgent' },
];

const mockPlanningCantine = [
  { id: 1, date: 'Lun 14 Sept', family: 'Maman L. Gérard', status: 'Confirmé' },
  { id: 2, date: 'Mar 15 Sept', family: 'À pourvoir', status: 'Urgent' },
];

const mockEvenements = [
  { id: 1, name: 'Brocante de Septembre', recettes: 1450, depenses: 230, date: '05/09/2026' },
];

const App = () => {
  // --- ÉTATS DE CONNEXION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // contiendra { email, role }
  
  // États de l'interface
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isScolariteOpen, setIsScolariteOpen] = useState(false);
  const [isPeriscolaireOpen, setIsPeriscolaireOpen] = useState(false);
  const [isLogistiqueOpen, setIsLogistiqueOpen] = useState(false);
  const [isEvenementsOpen, setIsEvenementsOpen] = useState(false);
  const [isRhOpen, setIsRhOpen] = useState(false);
  const [isComptaOpen, setIsComptaOpen] = useState(false);
  const [isSuiviOpen, setIsSuiviOpen] = useState(false);
  const [isEngagementOpen, setIsEngagementOpen] = useState(false);

  // --- FONCTION DE CONNEXION (SIMULÉE AVANT FIREBASE) ---
  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === 'admin@courstommorel.fr' && password === 'admin123') {
      setCurrentUser({ email: email, role: 'admin', name: 'Le Bureau' });
      setIsAuthenticated(true);
      setActiveTab('dashboard');
    } else if (email === 'parent@courstommorel.fr' && password === 'parent123') {
      setCurrentUser({ email: email, role: 'parent', name: 'Famille Dupont' });
      setIsAuthenticated(true);
      setActiveTab('contact'); // Les parents arrivent sur l'écran contact par défaut
    } else {
      alert("Identifiants incorrects. Essayez admin@courstommorel.fr (mdp: admin123) ou parent@courstommorel.fr (mdp: parent123)");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // ==========================================
  // ÉCRAN DE CONNEXION (LOGIN)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-indigo-500 shadow-md">
              <img src={LOGO_URL} alt="Logo" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              <GraduationCap size={40} className="text-indigo-600 absolute z-[-1]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Cours Tom Morel</h1>
          <p className="text-center text-slate-500 mb-8 text-sm">Portail sécurisé de l'établissement</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Adresse E-mail</label>
              <input type="email" name="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="nom@exemple.com" defaultValue="admin@courstommorel.fr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input type="password" name="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" defaultValue="admin123" />
                <Lock size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-4">
              Se connecter
            </button>
          </form>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg text-xs text-blue-800 border border-blue-100">
            <strong>Pour tester :</strong><br/>
            Admin : admin@courstommorel.fr / admin123<br/>
            Parent : parent@courstommorel.fr / parent123
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // COMPOSANTS (MODULES) DE L'APPLICATION
  // ==========================================

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
      
      {['admin'].includes(currentUser.role) && (
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
    </div>
  );

  const InfosContactModule = () => (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-2xl shadow-md p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Info className="text-blue-200" size={32}/> Informations Pratiques
          </h2>
          <p className="text-blue-100 max-w-2xl text-lg">Retrouvez ici toutes les coordonnées pour contacter l'équipe pédagogique.</p>
        </div>
        <div className="absolute -right-10 -top-10 opacity-10">
          <GraduationCap size={250} />
        </div>
      </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-700 text-white text-center py-2 font-bold text-sm tracking-wider">BILAN (Aperçu)</div>
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 border-r border-slate-200 p-4">
              <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 text-xs border-b border-blue-100">ACTIF (Banque 512)</div>
              <div className="p-4"><span className="text-slate-800 font-bold text-xl">18 450,00 €</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlanningFamillesModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UsersRound className="text-emerald-600"/> Plannings d'Engagement
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-800 p-4 text-white flex items-center gap-2"><Sparkles size={18} className="text-amber-400" /><h3 className="font-bold">Ménage du Week-end</h3></div>
          <ul className="divide-y divide-slate-100 flex-1">
            {mockPlanningMenage.map(plan => (
              <li key={plan.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div><p className="font-bold text-slate-800">{plan.date}</p><p className="text-sm text-slate-500">{plan.family}</p></div>
                {plan.status === 'Urgent' ? <button className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">S'inscrire</button> : <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">{plan.status}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

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
          <div className="h-10 w-10 flex-shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-500">
            <img src={LOGO_URL} alt="Logo de l'école" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            <GraduationCap size={20} className="text-indigo-600 absolute z-[-1]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide leading-tight">COURS TOM MOREL</h1>
            <p className="text-[9px] text-indigo-300 uppercase tracking-widest font-semibold mt-0.5">Assoc. Mon École en Dauphiné</p>
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1">
          {currentUser.role === 'admin' && (
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
              <LayoutDashboard size={18} /> Tableau de bord
            </button>
          )}
          
          <button onClick={() => setActiveTab('contact')} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium ${activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Info size={18} /> Infos & Contact
          </button>

          {/* SCOLARITÉ (Parents voient leurs dossiers, Admin voit tout) */}
          <div className="mt-2">
            <button onClick={() => setIsScolariteOpen(!isScolariteOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
              <span className="flex items-center gap-2"><BookOpen size={14}/> Scolarité</span>
              {isScolariteOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isScolariteOpen && (
              <button onClick={() => setActiveTab('dossiers')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'dossiers' ? 'text-indigo-400' : 'hover:text-white'}`}>
                📝 {currentUser.role === 'parent' ? 'Mes Dossiers' : 'Dossiers (GS-CM2)'}
              </button>
            )}
          </div>

          {/* COMPTABILITÉ (Admin Seulement) */}
          {currentUser.role === 'admin' && (
            <div className="mt-2">
              <button onClick={() => setIsComptaOpen(!isComptaOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
                <span className="flex items-center gap-2"><Landmark size={14}/> Comptabilité</span>
                {isComptaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isComptaOpen && (
                <>
                  <button onClick={() => setActiveTab('journal')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'journal' ? 'text-indigo-400' : 'hover:text-white'}`}>🏦 Journal & OD</button>
                  <button onClick={() => setActiveTab('etatsFinanciers')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'etatsFinanciers' ? 'text-indigo-400' : 'hover:text-white'}`}>📊 États Financiers</button>
                  <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'budget' ? 'text-indigo-400' : 'hover:text-white'}`}>📈 Budget Prévisionnel</button>
                  <button onClick={() => setActiveTab('notesDeFrais')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'notesDeFrais' ? 'text-indigo-400' : 'hover:text-white'}`}><Receipt size={14} /> Notes de Frais</button>
                  <button onClick={() => setActiveTab('dons')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'dons' ? 'text-indigo-400' : 'hover:text-white'}`}><Gift size={14} /> Dons & Mécénat</button>
                </>
              )}
            </div>
          )}

          {/* PÉRISCOLAIRE (Garderie) */}
          <div className="mt-2">
            <button onClick={() => setIsPeriscolaireOpen(!isPeriscolaireOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
              <span className="flex items-center gap-2"><Tent size={14}/> Périscolaire</span>
              {isPeriscolaireOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isPeriscolaireOpen && (
              <button onClick={() => setActiveTab('garderie')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'garderie' ? 'text-indigo-400' : 'hover:text-white'}`}>🧩 Garderie</button>
            )}
          </div>

          {/* ENGAGEMENT FAMILLES (Tout le monde) */}
          <div className="mt-2">
            <button onClick={() => setIsEngagementOpen(!isEngagementOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
              <span className="flex items-center gap-2"><UsersRound size={14}/> Plannings Parents</span>
              {isEngagementOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isEngagementOpen && (
              <button onClick={() => setActiveTab('plannings')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'plannings' ? 'text-indigo-400' : 'hover:text-white'}`}>📅 Ménage & Cantine</button>
            )}
          </div>

          {/* LOGISTIQUE (Admin) */}
          {currentUser.role === 'admin' && (
            <div className="mt-2">
              <button onClick={() => setIsLogistiqueOpen(!isLogistiqueOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
                <span className="flex items-center gap-2"><PackageSearch size={14}/> Logistique</span>
                {isLogistiqueOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isLogistiqueOpen && (
                <button onClick={() => setActiveTab('uniformes')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'uniformes' ? 'text-indigo-400' : 'hover:text-white'}`}>👕 Stock Uniformes</button>
              )}
            </div>
          )}

           {/* RH & ASSURANCES (Admin Seulement) */}
           {currentUser.role === 'admin' && (
            <div className="mt-2">
              <button onClick={() => setIsRhOpen(!isRhOpen)} className="flex items-center justify-between w-full px-6 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-300">
                <span className="flex items-center gap-2"><Briefcase size={14}/> Équipe & Sécurité</span>
                {isRhOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isRhOpen && (
                <>
                  <button onClick={() => setActiveTab('contrats')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'contrats' ? 'text-indigo-400' : 'hover:text-white'}`}><FileSignature size={14} /> Contrats</button>
                  <button onClick={() => setActiveTab('formations')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'formations' ? 'text-indigo-400' : 'hover:text-white'}`}><GraduationCap size={14} /> Formations</button>
                  <button onClick={() => setActiveTab('assurances')} className={`w-full flex items-center gap-3 pl-10 pr-6 py-2 text-sm ${activeTab === 'assurances' ? 'text-indigo-400' : 'hover:text-white'}`}><Shield size={14} /> Assurances</button>
                </>
              )}
            </div>
          )}
        </nav>
        
        {/* BOUTON DÉCONNEXION */}
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 bg-slate-800 hover:bg-rose-900/50 hover:text-rose-400 text-slate-400 rounded-lg text-sm transition-colors">
              <LogOut size={16} /> Déconnexion
           </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 relative">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-xs text-slate-500 capitalize">Profil : {currentUser.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardModule />}
            {activeTab === 'contact' && <InfosContactModule />}
            {activeTab === 'etatsFinanciers' && <FinancialStatementsModule />}
            {activeTab === 'plannings' && <PlanningFamillesModule />}
            
            {activeTab === 'journal' && <GenericPlaceholder icon={<Landmark size={48} className="text-slate-500"/>} title="Journal Comptable" desc="Ici, tes relevés bancaires .csv seront bientôt importés." color="slate"/>}
            {activeTab === 'budget' && <GenericPlaceholder icon={<Euro size={48} className="text-indigo-500"/>} title="Budget Prévisionnel" desc="Suivi des dépenses allouées vs réalisées." color="indigo"/>}
            {activeTab === 'dons' && <GenericPlaceholder icon={<Gift size={48} className="text-pink-500"/>} title="Dons & Mécénat" desc="Génération des reçus fiscaux." color="pink"/>}
            {activeTab === 'dossiers' && <GenericPlaceholder icon={<BookOpen size={48} className="text-blue-500"/>} title="Dossiers Scolaires" desc="Informations médicales et contacts d'urgence." color="blue"/>}
            {activeTab === 'assurances' && <GenericPlaceholder icon={<Shield size={48} className="text-red-500"/>} title="Assurances" desc="Attestations RC et locaux." color="red"/>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
