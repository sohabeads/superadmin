import React, { useState, useEffect } from 'react';
import {
  School,
  CheckCircle,
  AlertTriangle,
  Users,
  Plus,
  FileSpreadsheet,
  FileJson,
  UploadCloud,
  History,
  Check,
  ChevronRight,
  Search,
  BookOpen,
  UserCheck,
  Trash2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Bell,
  CheckSquare,
  FileText,
  UserCircle,
  HelpCircle,
  Info,
  Calendar,
  AlertCircle,
  Receipt,
  CreditCard
} from 'lucide-react';

// Import Interfaces and Data from mockData
import {
  SchoolItem,
  ActivityItem,
  StudentGrade,
  GradingSession,
  PaymentItem,
  initialSchools,
  initialActivities,
  initialGradingQueue,
  initialPayments
} from './mockData';

export default function App() {
  // App state
  const [currentView, setCurrentView] = useState<'dashboard' | 'schools' | 'import' | 'grading' | 'queue' | 'create-school' | 'billing'>('dashboard');
  const [theme, setTheme] = useState<'blue' | 'indigo'>('blue');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Accent brand color variables
  const pBg = theme === 'indigo' ? 'bg-indigo-600' : 'bg-[#00236f]';
  const pHover = theme === 'indigo' ? 'hover:bg-indigo-700' : 'hover:bg-[#001D5C]';
  const pText = theme === 'indigo' ? 'text-indigo-600' : 'text-[#00236f]';
  const pHoverText = theme === 'indigo' ? 'hover:text-indigo-700' : 'hover:text-[#001D5C]';
  const pBorder = theme === 'indigo' ? 'border-indigo-600' : 'border-[#00236f]';
  const pRing = theme === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-[#00236f]';
  const pFocusRing = theme === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-[#00236f]';

  // --- Data Stores initialized from mockData file ---
  const [schools, setSchools] = useState<SchoolItem[]>(initialSchools);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [gradingQueue, setGradingQueue] = useState<GradingSession[]>(initialGradingQueue);
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);

  // New payment form states
  const [newPaymentSchoolId, setNewPaymentSchoolId] = useState<string>('');
  const [newPaymentMonth, setNewPaymentMonth] = useState<string>('Août 2026');
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'Mobile Money' | 'Espèces' | 'Virement' | 'Chèque'>('Mobile Money');
  const [newPaymentNotes, setNewPaymentNotes] = useState<string>('');
  const [paymentFilterSchoolId, setPaymentFilterSchoolId] = useState<string>('all');

  // Active session for grade entering screen
  const [selectedGradingSession, setSelectedGradingSession] = useState<GradingSession>(initialGradingQueue[0]);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState<number>(0);
  const [jsonPasteContent, setJsonPasteContent] = useState<string>('');
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);

  // Stats system
  const [statCounters, setStatCounters] = useState({
    todayProcessed: 45,
    anomalies: 2,
    totalStudents: '845.2K',
  });

  // UI Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'info' | 'error' }>({
    message: '',
    visible: false,
    type: 'success',
  });

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, visible: true, type });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Current Date Helper
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const rawDate = new Date().toLocaleDateString('fr-FR', dateOptions);
  const formattedCurrentDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  // --- Create School State Wizard ---
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardData, setWizardData] = useState({
    name: '',
    address: '',
    type: 'Primaire' as SchoolItem['type'],
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    } else {
      // final submit
      const newSchool: SchoolItem = {
        id: String(schools.length + 1),
        name: wizardData.name || 'Nouvelle École',
        type: wizardData.type,
        address: wizardData.address || 'Adresse Inconnue',
        adminName: wizardData.adminName || 'Directeur de l\'école',
        adminEmail: wizardData.adminEmail || 'admin@ecole.fr',
        status: 'Actives',
        studentCount: Math.floor(Math.random() * 500) + 150,
      };

      setSchools([newSchool, ...schools]);

      // Add to activities
      const newActivity: ActivityItem = {
        id: 'act-' + (activities.length + 1),
        type: 'creation',
        title: `Nouvelle école créée: ${newSchool.name}`,
        time: 'À l\'instant',
        schoolName: newSchool.name,
      };
      setActivities([newActivity, ...activities]);

      // trigger success view
      setWizardStep(4);
      triggerToast(`École "${newSchool.name}" ajoutée au réseau avec succès !`, 'success');
    }
  };

  // --- Payment Registration Handler ---
  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentSchoolId) {
      triggerToast("Veuillez sélectionner un établissement.", "error");
      return;
    }
    const schoolObj = schools.find(s => s.id === newPaymentSchoolId);
    if (!schoolObj) return;

    if (newPaymentAmount <= 0) {
      triggerToast("Le montant du versement doit être supérieur à 0 FCFA.", "error");
      return;
    }

    // Calculate remaining debt
    const expectedTotal = schoolObj.studentCount * 1000;
    const totalPaidAlready = payments
      .filter(p => p.schoolId === schoolObj.id && p.month === newPaymentMonth)
      .reduce((acc, p) => acc + p.amountPaid, 0);
    const maxAllowed = expectedTotal - totalPaidAlready;

    if (newPaymentAmount > maxAllowed) {
      triggerToast(`Le montant saisi (${newPaymentAmount.toLocaleString()} FCFA) dépasse la dette restante (${maxAllowed.toLocaleString()} FCFA).`, "error");
      return;
    }

    const calculatedPaidStudents = Math.round(newPaymentAmount / 1000);

    const newPayment: PaymentItem = {
      id: `pay-${Date.now()}`,
      schoolId: newPaymentSchoolId,
      schoolName: schoolObj.name,
      month: newPaymentMonth,
      amountPaid: newPaymentAmount,
      paidStudentsCount: calculatedPaidStudents,
      totalStudentsCount: schoolObj.studentCount,
      ratePerStudent: 1000,
      datePaid: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      paymentMethod: newPaymentMethod,
      notes: newPaymentNotes || 'Règlement enregistré via le module de facturation superadmin.'
    };

    setPayments([newPayment, ...payments]);
    
    // Create new activity entry
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'update',
      title: `Paiement de ${newPaymentAmount.toLocaleString()} FCFA reçu de ${schoolObj.name}`,
      time: "À l'instant",
      schoolName: schoolObj.name
    };
    setActivities([newAct, ...activities]);

    triggerToast(`Paiement de ${newPaymentAmount.toLocaleString()} FCFA enregistré pour ${schoolObj.name} !`, "success");
    
    // Clear form inputs
    setNewPaymentSchoolId('');
    setNewPaymentAmount(0);
    setNewPaymentNotes('');
  };

  // --- Data Importation State ---
  const [importTargetSchool, setImportTargetSchool] = useState<string>('');
  const [importJsonPayload, setImportJsonPayload] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessData, setImportSuccessData] = useState<{ classes: number; students: number; teachers: number } | null>(null);

  const handleImportJson = () => {
    if (!importTargetSchool) {
      triggerToast('Veuillez sélectionner une école de destination.', 'error');
      return;
    }

    try {
      if (!importJsonPayload.trim()) {
        throw new Error('Le payload JSON ne peut pas être vide.');
      }
      const parsed = JSON.parse(importJsonPayload);
      
      // Simulate validation check
      if (Array.isArray(parsed)) {
        const studentCount = parsed.length;
        const classesCount = Math.ceil(studentCount / 20) || 1;
        const teacherCount = Math.ceil(classesCount * 1.5) || 1;

        setImportError(null);
        setImportSuccessData({
          classes: classesCount,
          students: studentCount,
          teachers: teacherCount,
        });
        triggerToast('JSON validé avec succès. Prêt pour l\'importation.', 'success');
      } else {
        throw new Error('Le JSON racine doit être une liste d\'objets représentant les élèves.');
      }
    } catch (err: any) {
      setImportError(`Erreur de validation: ${err.message || 'Syntaxe JSON invalide'}`);
      setImportSuccessData(null);
      triggerToast('La validation du payload JSON a échoué.', 'error');
    }
  };

  const handleFinalizeImport = () => {
    if (!importSuccessData) return;

    const targetSchoolObj = schools.find(s => s.id === importTargetSchool);
    const targetName = targetSchoolObj ? targetSchoolObj.name : 'Académie ClassiNote';

    // update school student count
    setSchools(schools.map(s => {
      if (s.id === importTargetSchool) {
        return { ...s, studentCount: s.studentCount + importSuccessData.students };
      }
      return s;
    }));

    // Add activity
    const newActivity: ActivityItem = {
      id: 'act-' + (activities.length + 1),
      type: 'import',
      title: `Importation réussie de ${importSuccessData.students} élèves pour: ${targetName}`,
      time: 'À l\'instant',
      schoolName: targetName,
    };
    setActivities([newActivity, ...activities]);

    triggerToast(`Importation de ${importSuccessData.students} élèves finalisée avec succès !`, 'success');
    
    // reset import
    setImportTargetSchool('');
    setImportJsonPayload('');
    setImportSuccessData(null);
    setCurrentView('dashboard');
  };

  // Pre-fill Template JSON for Import
  const handlePrefillImportJson = () => {
    const demoPayload = [
      { "id": "std-101", "name": "Benoît Tremblay", "class": "6ème A", "parentEmail": "b.tremblay@gmail.com" },
      { "id": "std-102", "name": "Emma Watson", "class": "6ème A", "parentEmail": "watson.emma@outlook.com" },
      { "id": "std-103", "name": "Jean-Pierre Papin", "class": "5ème B", "parentEmail": "jppapin@gmail.com" },
      { "id": "std-104", "name": "Sandrine Bonnaire", "class": "4ème C", "parentEmail": "sbonnaire@free.fr" },
      { "id": "std-105", "name": "Alain Delon", "class": "3ème B", "parentEmail": "delon.alain@cinema.fr" }
    ];
    setImportJsonPayload(JSON.stringify(demoPayload, null, 2));
    setImportError(null);
    setImportSuccessData(null);
  };

  // --- Grade Submission Functions ---
  const handleGradeChange = (studentId: string, value: string) => {
    // Validate value max 20, positive
    if (value !== '') {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 20) return;
    }

    const updatedStudents = selectedGradingSession.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          grade: value,
          status: value !== '' ? 'completed' as const : 'pending' as const,
        };
      }
      return s;
    });

    const updatedSession = { ...selectedGradingSession, students: updatedStudents };
    setSelectedGradingSession(updatedSession);
    
    // sync queue item as well
    setGradingQueue(gradingQueue.map(q => q.id === selectedGradingSession.id ? updatedSession : q));
  };

  const handleApplyJsonGrades = () => {
    try {
      if (!jsonPasteContent.trim()) {
        throw new Error('Veuillez coller un JSON de notes d\'abord.');
      }
      const parsed = JSON.parse(jsonPasteContent);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Le JSON doit être une liste d\'objets avec les propriétés "id" (ou "index") et "grade".');
      }

      // Try mapping grades to students
      let count = 0;
      const updatedStudents = selectedGradingSession.students.map((student, idx) => {
        // match by name (loose) or relative index
        const match = parsed.find((item: any, pIdx: number) => {
          return (item.name && student.name.toLowerCase().includes(item.name.toLowerCase())) || 
                 (item.id && student.id === item.id) ||
                 (pIdx === idx);
        });

        if (match && match.grade !== undefined) {
          count++;
          return {
            ...student,
            grade: String(match.grade),
            status: 'completed' as const,
          };
        }
        return student;
      });

      const updatedSession = { ...selectedGradingSession, students: updatedStudents };
      setSelectedGradingSession(updatedSession);
      setGradingQueue(gradingQueue.map(q => q.id === selectedGradingSession.id ? updatedSession : q));
      
      triggerToast(`${count} notes extraites et appliquées automatiquement !`, 'success');
      setJsonPasteContent('');
    } catch (err: any) {
      triggerToast(`Erreur d'extraction JSON: ${err.message}`, 'error');
    }
  };

  const handlePrefillGradesJson = () => {
    const demoGrades = [
      { "id": "stud-1", "name": "Dubois, Alice", "grade": 17.5 },
      { "id": "stud-2", "name": "Martin, Lucas", "grade": 13.0 },
      { "id": "stud-3", "name": "Petit, Emma", "grade": 15.5 },
      { "id": "stud-4", "name": "Roux, Thomas", "grade": 11.5 }
    ];
    setJsonPasteContent(JSON.stringify(demoGrades, null, 2));
  };

  const handleSaveGradesSubmission = () => {
    const allGraded = selectedGradingSession.students.every(s => s.status === 'completed');
    const gradedCount = selectedGradingSession.students.filter(s => s.status === 'completed').length;
    const totalCount = selectedGradingSession.students.length;

    // Transition status to Traité
    const updatedSession: GradingSession = {
      ...selectedGradingSession,
      status: 'Traité'
    };
    setSelectedGradingSession(updatedSession);
    setGradingQueue(gradingQueue.map(q => q.id === selectedGradingSession.id ? updatedSession : q));

    // Stats update
    setStatCounters(prev => ({
      ...prev,
      todayProcessed: prev.todayProcessed + 1
    }));

    // Add activity
    const newActivity: ActivityItem = {
      id: 'act-' + (activities.length + 1),
      type: 'update',
      title: `Notes enregistrées par ${selectedGradingSession.teacherName} (${gradedCount}/${totalCount} copies)`,
      time: 'À l\'instant',
      schoolName: selectedGradingSession.className
    };
    setActivities([newActivity, ...activities]);

    triggerToast(`Saisie enregistrée avec succès ! (${gradedCount}/${totalCount} élèves)`, 'success');
    setCurrentView('queue');
  };

  const loadSessionFromQueue = (session: GradingSession) => {
    setSelectedGradingSession(session);
    setSelectedCopyIndex(0);
    setJsonPasteContent('');
    setCurrentView('grading');
    triggerToast(`Session chargée pour ${session.teacherName}`, 'info');
  };

  const handleValidateAllQueue = () => {
    setGradingQueue(gradingQueue.map(q => ({ ...q, status: 'Traité' as const })));
    setStatCounters(prev => ({
      ...prev,
      todayProcessed: prev.todayProcessed + gradingQueue.filter(q => q.status === 'En attente').length
    }));
    triggerToast('Toutes les demandes en attente ont été validées globalement.', 'success');
  };

  // Calculated variables
  const totalSchoolsCount = schools.length;
  const activeSchoolsCount = schools.filter(s => s.status === 'Actives').length;
  const suspendedSchoolsCount = schools.filter(s => s.status === 'Suspendues').length;
  const pendingGradesSubmissions = gradingQueue.filter(q => q.status === 'En attente').length;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800 font-sans antialiased w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-20 right-4 z-[100] max-w-md animate-bounce shadow-xl rounded-xl overflow-hidden pointer-events-auto">
          <div className={`flex items-start gap-3 p-4 border-l-4 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' :
            'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" /> : 
             toast.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" /> : 
             <Info className="w-5 h-5 shrink-0 text-blue-600" />}
            <div>
              <p className="font-semibold text-sm">Système ClassiNote</p>
              <p className="text-xs mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR COMPONENT (VERTICAL) --- */}
      {/* Desktop Sidebar (always visible on md+) */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200/75 z-30 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('dashboard')} 
            className={`text-2xl font-black tracking-tight cursor-pointer hover:opacity-95 transition-opacity flex items-center gap-2 ${pText}`}
          >
            ClassiNote
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              currentView === 'dashboard' 
                ? `${pBg} text-white shadow-md` 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <School className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap truncate">Tableau de bord</span>
          </button>

          <button
            onClick={() => { setCurrentView('schools'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              currentView === 'schools' 
                ? `${pBg} text-white shadow-md` 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap truncate">Écoles</span>
          </button>

          <button
            onClick={() => { setCurrentView('import'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              currentView === 'import' 
                ? `${pBg} text-white shadow-md` 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap truncate">Importation</span>
          </button>

          <button
            onClick={() => { setCurrentView('queue'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              currentView === 'queue' 
                ? `${pBg} text-white shadow-md` 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <History className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap truncate">File d'attente</span>
            </div>
            {pendingGradesSubmissions > 0 && (
              <span className={`text-[10px] w-5.5 h-5.5 rounded-full flex items-center justify-center font-black ${
                currentView === 'queue' ? 'bg-white text-slate-900' : 'bg-rose-500 text-white shadow-sm'
              }`}>
                {pendingGradesSubmissions}
              </span>
            )}
          </button>

          <button
            onClick={() => { setCurrentView('billing'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              currentView === 'billing' 
                ? `${pBg} text-white shadow-md` 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap truncate">Facturation</span>
          </button>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-150 shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBthvyK4ZETcbveK9k5hS6FcSCmDBoSbicgdvjdsbIrzvBd6imwx69Jw7GojDn5PT4w6SGDuheRMUqCa-A4-wY9eHmJLjo-yZizYGzWo04XTYocGo7LBTrnBvfT7L23mh_vcwXde0zOc_ASPM779v3A3uCGcdrzb0NAhs8BdRTyNsD7oJUMqhUIaQnhbilFu_lwV9FCucbP_DS2a5ysKj3Pj18z7BC97P9HZATzFphpEj9Tp-oYollOkA" 
                alt="Profile Admin" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">Jean Dupont</p>
              <p className="text-[10px] text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Panel Drawer */}
          <aside className="relative flex flex-col w-64 bg-white h-full shadow-2xl z-10 animate-fadeIn left-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div 
                onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} 
                className={`text-2xl font-black tracking-tight cursor-pointer ${pText}`}
              >
                ClassiNote
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                title="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              <button
                onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentView === 'dashboard' 
                    ? `${pBg} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <School className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap truncate">Tableau de bord</span>
              </button>

              <button
                onClick={() => { setCurrentView('schools'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentView === 'schools' 
                    ? `${pBg} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap truncate">Écoles</span>
              </button>

              <button
                onClick={() => { setCurrentView('import'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentView === 'import' 
                    ? `${pBg} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap truncate">Importation</span>
              </button>

              <button
                onClick={() => { setCurrentView('queue'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentView === 'queue' 
                    ? `${pBg} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <History className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap truncate">File d'attente</span>
                </div>
                {pendingGradesSubmissions > 0 && (
                  <span className={`text-[10px] w-5.5 h-5.5 rounded-full flex items-center justify-center font-black ${
                    currentView === 'queue' ? 'bg-white text-slate-900' : 'bg-rose-500 text-white shadow-sm'
                  }`}>
                    {pendingGradesSubmissions}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setCurrentView('billing'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentView === 'billing' 
                    ? `${pBg} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap truncate">Facturation</span>
              </button>
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-150">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBthvyK4ZETcbveK9k5hS6FcSCmDBoSbicgdvjdsbIrzvBd6imwx69Jw7GojDn5PT4w6SGDuheRMUqCa-A4-wY9eHmJLjo-yZizYGzWo04XTYocGo7LBTrnBvfT7L23mh_vcwXde0zOc_ASPM779v3A3uCGcdrzb0NAhs8BdRTyNsD7oJUMqhUIaQnhbilFu_lwV9FCucbP_DS2a5ysKj3Pj18z7BC97P9HZATzFphpEj9Tp-oYollOkA" 
                    alt="Profile Admin" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">Jean Dupont</p>
                  <p className="text-[10px] text-slate-500 truncate">Super Admin</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* --- MAIN PAGE WRAPPER --- */}
      <div className="flex-1 min-h-screen md:pl-64 flex flex-col min-w-0 bg-[#F8FAFC]">
        
        {/* Top Header Row of Dashboard Wrapper */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200/75 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
              title="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Context/View Title */}
            <h2 className="text-md md:text-lg font-bold text-slate-800 truncate flex items-center gap-2">
              <span>{
                currentView === 'dashboard' ? 'Tableau de bord' :
                currentView === 'schools' ? "Réseau d'Établissements" :
                currentView === 'import' ? 'Importation de Données' :
                currentView === 'grading' ? 'Saisie des Notes' :
                currentView === 'queue' ? "File d'attente des Soumissions" :
                currentView === 'create-school' ? "Créer un nouvel Établissement" : "ClassiNote"
              }</span>
              {currentView === 'grading' && (
                <span className="hidden sm:inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Saisie Active
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Billing Notice */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Facturation : 1er Avril</span>
            </span>

            {/* Accent Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'blue' ? 'indigo' : 'blue')}
              title="Changer de thème visuel"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Sparkles className={`w-4 h-4 ${theme === 'indigo' ? 'text-indigo-600 animate-pulse' : 'text-blue-600'}`} />
              <span className="hidden sm:inline">{theme === 'blue' ? 'Thème Bleu' : 'Thème Indigo'}</span>
            </button>

            {/* Quick Action button for desktop */}
            <button 
              onClick={() => {
                setWizardStep(1);
                setWizardData({
                  name: '',
                  address: '',
                  type: 'Primaire',
                  adminName: '',
                  adminEmail: '',
                  adminPassword: '',
                });
                setCurrentView('create-school');
              }}
              className={`hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white rounded-full transition-transform active:scale-95 shadow-sm ${pBg} ${pHover}`}
            >
              <Plus className="w-4 h-4" />
              <span>Créer école</span>
            </button>

            {/* Profile Avatar with status trigger */}
            <div 
              onClick={() => triggerToast("Connecté en tant que Jean Dupont (Super Admin)", "info")}
              className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer shrink-0"
              title="Mon Profil"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBthvyK4ZETcbveK9k5hS6FcSCmDBoSbicgdvjdsbIrzvBd6imwx69Jw7GojDn5PT4w6SGDuheRMUqCa-A4-wY9eHmJLjo-yZizYGzWo04XTYocGo7LBTrnBvfT7L23mh_vcwXde0zOc_ASPM779v3A3uCGcdrzb0NAhs8BdRTyNsD7oJUMqhUIaQnhbilFu_lwV9FCucbP_DS2a5ysKj3Pj18z7BC97P9HZATzFphpEj9Tp-oYollOkA" 
                alt="Profile Admin" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Global Info Banner */}
        <div className="bg-amber-50/70 text-amber-800 px-4 md:px-8 py-2.5 text-xs font-semibold flex items-center gap-2 border-b border-amber-100/50">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Rappel : Cycle de facturation global de ClassiNote prévu pour le 1er Avril 2026.</span>
        </div>

        {/* Main Canvas Context */}
        <main className="flex-grow p-4 md:p-8 min-w-0">
        
        {/* --- VIEW 1: DASHBOARD --- */}
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                  Bonjour, Jean Dupont
                </h1>
                <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${pText}`} />
                  <span>{formattedCurrentDate}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setWizardStep(1);
                    setWizardData({ name: '', address: '', type: 'Primaire', adminName: '', adminEmail: '', adminPassword: '' });
                    setCurrentView('create-school');
                  }}
                  className="px-4 py-2.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-2 transition-transform active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau compte école
                </button>
              </div>
            </div>

            {/* KPI Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Écoles Totales */}
              <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <School className={`w-16 h-16 ${pText}`} />
                </div>
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${pText} mb-4`}>
                  <School className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Écoles Totales</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalSchoolsCount}</p>
              </div>

              {/* Card 2: Actives */}
              <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actives</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{activeSchoolsCount}</p>
              </div>

              {/* Card 3: Suspendues */}
              <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AlertTriangle className="w-16 h-16 text-amber-500" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suspendues</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{suspendedSchoolsCount}</p>
              </div>

              {/* Card 4: Élèves (Global) */}
              <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className={`w-16 h-16 ${pText}`} />
                </div>
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${pText} mb-4`}>
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Élèves (Global)</p>
                <p className={`text-3xl font-extrabold ${pText} mt-1`}>{statCounters.totalStudents}</p>
              </div>
            </div>

            {/* Quick Billing Alert Banner for Super Admin */}
            {(() => {
              const currentMonthStr = "Août 2026";
              let totalForecasted = 0;
              let totalCollected = 0;
              schools.forEach(s => {
                totalForecasted += s.studentCount * 1000;
              });
              payments.filter(p => p.month === currentMonthStr).forEach(p => {
                totalCollected += p.amountPaid;
              });
              const totalPending = totalForecasted - totalCollected;

              return (
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Facturation Globale — {currentMonthStr}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prévisions: <span className="font-bold text-slate-700">{totalForecasted.toLocaleString('fr-FR')} FCFA</span> | 
                        Recouvré: <span className="font-bold text-emerald-600">{totalCollected.toLocaleString('fr-FR')} FCFA</span> | 
                        Attente: <span className="font-bold text-amber-600">{totalPending.toLocaleString('fr-FR')} FCFA</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('billing')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${pBg} ${pHover}`}
                  >
                    Gérer la Facturation
                  </button>
                </div>
              );
            })()}

            {/* Main grid section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Recent Activity Feed */}
              <div className="lg:col-span-2 bg-white rounded-[24px] p-6 border border-slate-200/80">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <History className={`w-5 h-5 ${pText}`} />
                    <span>Activité Récente</span>
                  </h3>
                  <button 
                    onClick={() => {
                      triggerToast("Historique complet chargé en cache.", "info");
                    }} 
                    className={`text-xs font-bold ${pText} hover:underline`}
                  >
                    Voir tout l'historique
                  </button>
                </div>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'creation' ? 'bg-amber-100 text-amber-800' :
                        activity.type === 'import' ? 'bg-indigo-50 text-indigo-800' :
                        activity.type === 'update' ? 'bg-slate-100 text-slate-800' :
                        activity.type === 'suspension' ? 'bg-red-50 text-red-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        {activity.type === 'creation' && <Plus className="w-5 h-5" />}
                        {activity.type === 'import' && <UploadCloud className="w-5 h-5" />}
                        {activity.type === 'update' && <FileText className="w-5 h-5" />}
                        {activity.type === 'suspension' && <AlertTriangle className="w-5 h-5" />}
                        {activity.type === 'system' && <Sparkles className="w-5 h-5" />}
                      </div>

                      <div className="flex-grow">
                        <p className="text-sm font-semibold text-slate-800">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{activity.time}</span>
                          {activity.schoolName && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className={`text-xs ${pText} font-medium`}>{activity.schoolName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Quick Action Center */}
              <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Actions Rapides</h3>
                  
                  <div className="space-y-3">
                    
                    {/* Action 1: Saisie Automatique */}
                    <button 
                      onClick={() => {
                        const activeSession = gradingQueue.find(q => q.status === 'En attente') || gradingQueue[0];
                        loadSessionFromQueue(activeSession);
                      }}
                      className="w-full py-4 px-4 bg-[#FFE088] hover:bg-[#FED65B] text-[#574500] rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#735C00]" />
                      <span>Saisie Automatique (JSON)</span>
                    </button>

                    {/* Action 2: Créer une école */}
                    <button 
                      onClick={() => {
                        setWizardStep(1);
                        setWizardData({ name: '', address: '', type: 'Primaire', adminName: '', adminEmail: '', adminPassword: '' });
                        setCurrentView('create-school');
                      }}
                      className={`w-full py-4 px-4 text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${pBg} hover:opacity-95`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Créer une école</span>
                    </button>

                    {/* Action 3: Voir toutes les écoles */}
                    <button 
                      onClick={() => setCurrentView('schools')}
                      className="w-full py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <School className="w-4 h-4" />
                      <span>Voir toutes les écoles</span>
                    </button>

                    {/* Action 4: Importer des données JSON */}
                    <button 
                      onClick={() => setCurrentView('import')}
                      className="w-full py-4 px-4 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Importer des données</span>
                    </button>

                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-150">
                  <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl items-start">
                    <Info className={`w-5 h-5 ${pText} shrink-0 mt-0.5`} />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Portail d'administration ClassiNote. Vous pouvez importer les données brutes ou utiliser le module d'OCR intégré pour numériser les copies papier des élèves en quelques secondes.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- VIEW 2: SCHOOLS LIST --- */}
        {currentView === 'schools' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Réseau d'Établissements</h2>
                <p className="text-sm text-slate-500">Gérez les écoles partenaires de la plateforme ClassiNote.</p>
              </div>
              <button 
                onClick={() => {
                  setWizardStep(1);
                  setWizardData({ name: '', address: '', type: 'Primaire', adminName: '', adminEmail: '', adminPassword: '' });
                  setCurrentView('create-school');
                }}
                className={`px-4 py-2 text-white rounded-full text-sm font-bold flex items-center gap-2 ${pBg} hover:opacity-95`}
              >
                <Plus className="w-4 h-4" />
                Ajouter une école
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">École</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Adresse</th>
                      <th className="py-4 px-6">Administrateur</th>
                      <th className="py-4 px-6">Élèves</th>
                      <th className="py-4 px-6">Statut</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">{school.name}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                            {school.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 max-w-xs truncate">{school.address}</td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-slate-700">{school.adminName}</p>
                            <p className="text-xs text-slate-400">{school.adminEmail}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700">{school.studentCount}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            school.status === 'Actives' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                          }`}>
                            {school.status === 'Actives' ? 'Active' : 'Suspendue'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSchools(schools.map(s => {
                                  if (s.id === school.id) {
                                    const nextStatus = s.status === 'Actives' ? 'Suspendues' as const : 'Actives' as const;
                                    triggerToast(`Statut mis à jour pour ${s.name}`, 'info');
                                    
                                    // Add activity
                                    setActivities([{
                                      id: 'act-' + (activities.length + 1),
                                      type: nextStatus === 'Actives' ? 'update' : 'suspension',
                                      title: `${nextStatus === 'Actives' ? 'Réactivation' : 'Suspension temporaire'} de ${s.name}`,
                                      time: 'À l\'instant',
                                      schoolName: s.name
                                    }, ...activities]);

                                    return { ...s, status: nextStatus };
                                  }
                                  return s;
                                }));
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600"
                            >
                              {school.status === 'Actives' ? 'Suspendre' : 'Activer'}
                            </button>
                            <button 
                              onClick={() => {
                                setSchools(schools.filter(s => s.id !== school.id));
                                triggerToast(`École "${school.name}" supprimée de la base de données.`, 'error');
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="Supprimer l'école"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 3: IMPORT DATA --- */}
        {currentView === 'import' && (
          <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">Importation de données scolaires</h2>
              <p className="text-slate-500 mt-1">
                Importez de grands volumes de données élèves de manière sécurisée et rapide grâce aux payloads JSON standardisés.
              </p>
            </div>

            {/* Step 1: Select School */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${pBg} text-white flex items-center justify-center font-bold text-sm`}>
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-800">Sélectionner l'établissement de destination</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  École cible
                </label>
                <select
                  value={importTargetSchool}
                  onChange={(e) => setImportTargetSchool(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                >
                  <option value="">Sélectionner une école du réseau...</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type}) - {s.studentCount} élèves
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Paste JSON / Error Banner matching mockup */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${pBg} text-white flex items-center justify-center font-bold text-sm`}>
                    2
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Coller le Payload JSON</h3>
                </div>
                <button
                  type="button"
                  onClick={handlePrefillImportJson}
                  className="px-3 py-1.5 bg-[#FFE088] hover:bg-[#FED65B] text-[#574500] rounded-full text-xs font-bold transition-colors"
                >
                  Insérer modèle de test
                </button>
              </div>

              {/* Error Banner simulated directly from original image screenshot */}
              {importJsonPayload && !importSuccessData && (
                <div className="bg-[#FFDAD6] border border-red-300 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 text-sm">Erreur de validation attendue</h4>
                    <p className="text-xs text-red-800 mt-1 opacity-90 leading-relaxed">
                      Format suggéré: Liste d'objets JSON avec les attributs "id", "name", "class", et "parentEmail". 
                      Veuillez vous assurer de la cohérence structurelle du fichier.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <textarea
                  value={importJsonPayload}
                  onChange={(e) => {
                    setImportJsonPayload(e.target.value);
                    setImportSuccessData(null);
                    setImportError(null);
                  }}
                  placeholder={`[
  {
    "id": "std-001",
    "name": "Jean Dupont",
    "class": "6ème A",
    "parentEmail": "parent@email.com"
  }
]`}
                  className="w-full h-44 font-mono text-xs p-4 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#00236f] resize-y"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Format supporté: .json</span>
                <span>Taille max: 10 Mo</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleImportJson}
                  className={`px-6 py-3 text-white font-bold text-xs rounded-full hover:opacity-95 transition-opacity ${pBg}`}
                >
                  Valider le JSON
                </button>
              </div>
            </div>

            {/* Step 3: Validation & Preview */}
            <div className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 transition-opacity ${
              importSuccessData ? 'opacity-100' : 'opacity-55 pointer-events-none'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${pBg} text-white flex items-center justify-center font-bold text-sm`}>
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-800">Validation &amp; Aperçu des données</h3>
              </div>

              {importSuccessData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Classes Détectées</p>
                    <p className="text-3xl font-extrabold mt-1 text-slate-800">{importSuccessData.classes}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Élèves Détectés</p>
                    <p className={`text-3xl font-extrabold mt-1 ${pText}`}>{importSuccessData.students}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Enseignants Détectés</p>
                    <p className="text-3xl font-extrabold mt-1 text-slate-800">{importSuccessData.teachers}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setImportSuccessData(null);
                    setImportJsonPayload('');
                    setImportTargetSchool('');
                  }}
                  className="px-5 py-3 text-xs font-bold text-slate-500 hover:underline"
                >
                  Annuler
                </button>
                <button
                  onClick={handleFinalizeImport}
                  disabled={!importSuccessData}
                  className={`px-6 py-3 font-bold text-xs rounded-full shadow-md transition-opacity ${
                    importSuccessData 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Procéder à l'Importation finale
                </button>
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW 4: GRADING INTERACTIVE PORTAL --- */}
        {currentView === 'grading' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedGradingSession.teacherAvatar} 
                  alt={selectedGradingSession.teacherName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FFE088]"
                />
                <div>
                  <h3 className="font-bold text-slate-800">
                    {selectedGradingSession.teacherName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className={`font-bold ${pText}`}>{selectedGradingSession.subject}</span>
                    <span>•</span>
                    <span>{selectedGradingSession.className}</span>
                    <span>•</span>
                    <span>{selectedGradingSession.copyCount} copies soumises</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedGradingSession.status === 'En attente' 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedGradingSession.status === 'En attente' ? 'Saisie En Attente' : 'Validée & Traitée'}
                </span>
                <button
                  onClick={() => setCurrentView('queue')}
                  className={`px-3 py-1.5 text-xs font-bold ${pText} hover:underline`}
                >
                  Retour à la file
                </button>
              </div>
            </div>

            {/* Split Screen Layout matching image screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Image Viewer Gallery */}
              <div className="lg:col-span-5 bg-white p-5 rounded-[24px] border border-slate-200/80 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${pText}`} />
                    <span>Copie d'examen</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Page {selectedCopyIndex + 1} sur {selectedGradingSession.copies.length}
                  </span>
                </div>

                {/* Main Copy Canvas with interactive zoom trigger */}
                <div className="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden group border border-slate-100">
                  <img 
                    src={selectedGradingSession.copies[selectedCopyIndex]} 
                    alt={`Copie d'élève page ${selectedCopyIndex + 1}`}
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <button 
                      onClick={() => setZoomModalOpen(true)}
                      className={`p-3 bg-white ${pText} rounded-full shadow-lg pointer-events-auto transform transition-transform hover:scale-105 active:scale-95`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    Cliquez pour zoomer
                  </div>
                </div>

                {/* Thumbnail selector gallery */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x">
                  {selectedGradingSession.copies.map((copyUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCopyIndex(index)}
                      className={`relative shrink-0 w-16 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                        selectedCopyIndex === index 
                          ? `${pBorder} ring-2 ring-slate-100` 
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={copyUrl} alt={`Page template ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <div className="shrink-0 w-16 aspect-[3/4] bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Right Column: AI JSON input & Manual Grid */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* AI / JSON Recognition Input Box */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>Reconnaissance Automatique (JSON OCR)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handlePrefillGradesJson}
                      className={`text-xs font-bold ${pText} hover:underline`}
                    >
                      Charger JSON simulé
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    L'outil OCR génère un flux de notes structurées. Collez ou modifiez le JSON pour peupler instantanément la grille.
                  </p>

                  <div className="space-y-2">
                    <textarea
                      value={jsonPasteContent}
                      onChange={(e) => setJsonPasteContent(e.target.value)}
                      placeholder={`[
  { "id": "stud-1", "grade": 17.5 },
  { "id": "stud-2", "grade": 13.0 }
]`}
                      className="w-full h-24 font-mono text-xs p-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00236f] resize-y"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleApplyJsonGrades}
                        className="px-4 py-2 bg-[#FFE088] text-[#574500] font-bold text-xs rounded-full hover:bg-[#FED65B] transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Saisie Manuelle Table */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Grille de saisie des notes</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Saisissez les notes manuellement ou validez l'importation.</p>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                      {selectedGradingSession.students.filter(s => s.status === 'completed').length} / {selectedGradingSession.students.length} copies saisies
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                          <th className="py-3 px-4">Élève</th>
                          <th className="py-3 px-4 text-center w-36">Note (/20)</th>
                          <th className="py-3 px-4 text-center w-24">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 text-sm">
                        {selectedGradingSession.students.map((student) => (
                          <tr 
                            key={student.id} 
                            className={`hover:bg-slate-50/50 transition-colors ${
                              student.status === 'pending' ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-bold text-slate-700">{student.name}</td>
                            <td className="py-3 px-4">
                              <input 
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={student.grade}
                                onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                placeholder="--"
                                className="w-full bg-slate-50 text-center font-bold text-slate-800 rounded-lg py-1.5 focus:bg-white focus:ring-2 focus:ring-[#00236f] text-sm border-none"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              {student.status === 'completed' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs" title="Saisie complétée">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FFE088] text-[#735C00] font-bold text-xs animate-pulse" title="En attente de note">
                                  ...
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleSaveGradesSubmission}
                      className={`px-8 py-3.5 text-white font-bold text-sm rounded-full shadow-md flex items-center gap-2 transition-transform active:scale-[0.98] ${pBg} ${pHover}`}
                    >
                      <Check className="w-5 h-5" />
                      <span>Enregistrer les notes de la classe</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- VIEW 5: SUBMISSIONS QUEUE --- */}
        {currentView === 'queue' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 font-display">File d'attente des notes</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Validez et traitez les demandes de transmission de notes envoyées par les enseignants de vos écoles ClassiNote.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleValidateAllQueue}
                  className={`px-4 py-2.5 text-white text-xs font-bold rounded-full hover:opacity-90 flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${pBg}`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Tout valider
                </button>
              </div>
            </div>

            {/* Micro Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFE088]/20 text-amber-700 flex items-center justify-center font-bold text-lg">
                  {pendingGradesSubmissions}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">En attente</p>
                  <p className="text-lg font-bold text-slate-800">{pendingGradesSubmissions} Demandes</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  {statCounters.todayProcessed}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Traités aujourd'hui</p>
                  <p className="text-lg font-bold text-slate-800">{statCounters.todayProcessed} Classes</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                  {statCounters.anomalies}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Anomalies</p>
                  <p className="text-lg font-bold text-slate-800">{statCounters.anomalies} Non conformes</p>
                </div>
              </div>
            </div>

            {/* Interactive Submissions List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50/75 border-b border-slate-200 flex justify-between items-center">
                <h3 className={`font-bold text-sm ${pText}`}>Demandes récentes</h3>
                <span className="text-xs text-slate-400">Trier par: Date décroissante</span>
              </div>

              <div className="divide-y divide-slate-100">
                {gradingQueue.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadSessionFromQueue(item)}
                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={item.teacherAvatar} 
                          alt={item.teacherName} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          item.status === 'En attente' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
                        }`} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-base text-slate-800 group-hover:${pText} transition-colors`}>
                          {item.teacherName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                            {item.subject}
                          </span>
                          <span className="text-xs text-slate-400">{item.className}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <p className="font-bold text-sm text-slate-700">{item.copyCount} copies d'élèves</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.submittedTime}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border ${
                          item.status === 'En attente' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'En attente' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          {item.status}
                        </span>
                        
                        <ChevronRight className={`w-5 h-5 text-slate-300 group-hover:${pText} transition-colors transform group-hover:translate-x-1`} />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW 6: CREATE NEW SCHOOL WIZARD --- */}
        {currentView === 'create-school' && (
          <div className="max-w-2xl mx-auto bg-white rounded-[24px] border border-slate-200/80 p-6 md:p-8 shadow-md relative overflow-hidden animate-fadeIn">
            
            {/* Step Header */}
            {wizardStep <= 3 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-500">
                  <span>Étape {wizardStep} sur 3 : {
                    wizardStep === 1 ? "Informations de l'école" : 
                    wizardStep === 2 ? "Administrateur principal" : "Résumé & Validation"
                  }</span>
                  <span>{Math.round((wizardStep / 3) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`${pBg} h-full rounded-full transition-all duration-300`} 
                    style={{ width: `${(wizardStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSchoolSubmit} className="space-y-6">
              
              {/* STEP 1: School General Info */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Ajouter un nouvel établissement scolaire</h3>
                    <p className="text-sm text-slate-400 mt-1">Renseignez les détails géographiques et administratifs de l'école.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nom de l'école *
                    </label>
                    <input 
                      type="text"
                      required
                      value={wizardData.name}
                      onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                      placeholder="Ex: École Primaire Les Oliviers"
                      className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Adresse postale de l'établissement *
                    </label>
                    <textarea 
                      required
                      rows={3}
                      value={wizardData.address}
                      onChange={(e) => setWizardData({ ...wizardData, address: e.target.value })}
                      placeholder="123 Rue de l'Éducation, Paris 75012..."
                      className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f] resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Type d'établissement
                    </label>
                    <select
                      value={wizardData.type}
                      onChange={(e) => setWizardData({ ...wizardData, type: e.target.value as SchoolItem['type'] })}
                      className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                    >
                      <option value="Maternelle">Maternelle</option>
                      <option value="Primaire">Primaire</option>
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Main School Administrator Account */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Administrateur principal</h3>
                    <p className="text-sm text-slate-400 mt-1">Créez le compte d'accès pour le directeur ou le responsable informatique de cette école.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nom complet de l'administrateur *
                    </label>
                    <input 
                      type="text"
                      required
                      value={wizardData.adminName}
                      onChange={(e) => setWizardData({ ...wizardData, adminName: e.target.value })}
                      placeholder="Ex: Jean Dupont"
                      className="w-full bg-[#F2F4F6] dark:bg-[#2A2E33] rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-[#00236f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Adresse Email professionnelle *
                    </label>
                    <input 
                      type="email"
                      required
                      value={wizardData.adminEmail}
                      onChange={(e) => setWizardData({ ...wizardData, adminEmail: e.target.value })}
                      placeholder="jean.dupont@ecole.fr"
                      className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Mot de passe d'initialisation *
                    </label>
                    <input 
                      type="password"
                      required
                      value={wizardData.adminPassword}
                      onChange={(e) => setWizardData({ ...wizardData, adminPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Summary Preview */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Résumé de la création</h3>
                    <p className="text-sm text-slate-400 mt-1">Veuillez vérifier les informations suivantes avant de confirmer.</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 divide-y divide-slate-200">
                    
                    <div className="pb-3 flex gap-4 items-start">
                      <School className={`w-5 h-5 ${pText} shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-xs text-slate-400 font-bold">ÉCOLE</p>
                        <p className="text-base font-bold text-slate-800 mt-0.5">{wizardData.name}</p>
                        <p className="text-sm text-slate-500">{wizardData.address}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 bg-slate-150 ${pText} rounded text-[10px] font-bold uppercase tracking-wide`}>
                          Type: {wizardData.type}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex gap-4 items-start">
                      <UserCircle className={`w-5 h-5 ${pText} shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-xs text-slate-400 font-bold">ADMINISTRATEUR</p>
                        <p className="text-base font-bold text-slate-800 mt-0.5">{wizardData.adminName}</p>
                        <p className="text-sm text-slate-500">{wizardData.adminEmail}</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: Success Screen */}
              {wizardStep === 4 && (
                <div className="flex flex-col items-center text-center py-6 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-3xl">
                    ✓
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800">École créée avec succès !</h3>
                    <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
                      L'établissement <strong className="text-slate-800">"{wizardData.name}"</strong> a été configuré dans l'écosystème global de ClassiNote.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-left w-full max-w-md flex items-center gap-3 border border-slate-100">
                    <svg className={`w-6 h-6 ${pText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Un email d'invitation avec les accès sécurisés a été envoyé à :</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{wizardData.adminEmail}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setWizardStep(1);
                        setCurrentView('dashboard');
                      }}
                      className={`px-8 py-3.5 text-white font-bold rounded-full text-sm hover:opacity-95 shadow-md ${pBg}`}
                    >
                      Retour au tableau de bord
                    </button>
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              {wizardStep <= 3 && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep > 1) {
                        setWizardStep(wizardStep - 1);
                      } else {
                        setCurrentView('dashboard');
                      }
                    }}
                    className="px-4 py-2 text-sm font-bold text-slate-400 hover:underline"
                  >
                    Retour
                  </button>

                  <button
                    type="submit"
                    className={`px-6 py-3.5 text-white font-bold text-sm rounded-full hover:opacity-95 shadow-md ${pBg}`}
                  >
                    {wizardStep === 3 ? "Confirmer la création" : "Étape Suivante"}
                  </button>
                </div>
              )}

            </form>
          </div>
        )}

        {/* --- VIEW: BILLING/FACTURATION --- */}
        {currentView === 'billing' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 font-display">
                  Gestion de la Facturation
                </h1>
                <p className="text-slate-500 mt-1 font-medium text-sm">
                  Suivi des abonnements mensuels, des prévisions de recouvrement et enregistrement des paiements (1000 FCFA / élève / mois).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mois de facturation :</span>
                <select
                  value={newPaymentMonth}
                  onChange={(e) => setNewPaymentMonth(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f] shadow-xs"
                >
                  <option value="Août 2026">Août 2026</option>
                  <option value="Septembre 2026">Septembre 2026</option>
                  <option value="Octobre 2026">Octobre 2026</option>
                  <option value="Novembre 2026">Novembre 2026</option>
                </select>
              </div>
            </div>

            {/* Calculations block */}
            {(() => {
              // Calculate stats for the selected month
              let monthlyForecast = 0;
              let monthlyCollected = 0;
              
              schools.forEach(s => {
                monthlyForecast += s.studentCount * 1000;
              });

              const filteredPaymentsForMonth = payments.filter(p => p.month === newPaymentMonth);
              filteredPaymentsForMonth.forEach(p => {
                monthlyCollected += p.amountPaid;
              });

              const monthlyPending = monthlyForecast - monthlyCollected;
              const globalPayingStudents = filteredPaymentsForMonth.reduce((acc, p) => acc + p.paidStudentsCount, 0);
              const totalGlobalStudents = schools.reduce((acc, s) => acc + s.studentCount, 0);

              return (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Montant Prévisionnel */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Receipt className={`w-16 h-16 ${pText}`} />
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${pText} mb-4`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Montant Prévisionnel ({newPaymentMonth})</p>
                      <p className="text-3xl font-extrabold text-slate-800 mt-1">
                        {monthlyForecast.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">FCFA</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Basé sur {totalGlobalStudents.toLocaleString('fr-FR')} élèves au total à 1 000 FCFA/mois.
                      </p>
                    </div>

                    {/* Card 2: Montant Payé */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-16 h-16 text-emerald-600" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Montant Recouvré (Payé)</p>
                      <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                        {monthlyCollected.toLocaleString('fr-FR')} <span className="text-sm font-bold text-emerald-500">FCFA</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-2 font-semibold">
                        Couvre {globalPayingStudents.toLocaleString('fr-FR')} élèves sur {totalGlobalStudents.toLocaleString('fr-FR')} ({Math.round((globalPayingStudents / (totalGlobalStudents || 1)) * 100)}%).
                      </p>
                    </div>

                    {/* Card 3: Montant en Attente */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-16 h-16 text-amber-500" />
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${monthlyPending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'} mb-4`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reste à Recouvrer (En attente)</p>
                      <p className={`text-3xl font-extrabold mt-1 ${monthlyPending > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                        {monthlyPending.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">FCFA</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Soit {Math.max(0, totalGlobalStudents - globalPayingStudents).toLocaleString('fr-FR')} élèves restants à régulariser.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left side: Register payment form */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 h-fit space-y-6 shadow-xs">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <CreditCard className={`w-5 h-5 ${pText}`} />
                          <span>Enregistrer un Règlement</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Saisissez les informations de paiement pour enregistrer la contribution mensuelle d'un établissement.
                        </p>
                      </div>

                      <form onSubmit={handleRegisterPayment} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Sélectionner la dette active *
                          </label>
                          <select
                            value={newPaymentSchoolId}
                            onChange={(e) => {
                              const sId = e.target.value;
                              setNewPaymentSchoolId(sId);
                              const schoolObj = schools.find(sc => sc.id === sId);
                              if (schoolObj) {
                                const expectedTotal = schoolObj.studentCount * 1000;
                                const paidForMonth = payments
                                  .filter(p => p.schoolId === schoolObj.id && p.month === newPaymentMonth)
                                  .reduce((acc, p) => acc + p.amountPaid, 0);
                                const debt = expectedTotal - paidForMonth;
                                setNewPaymentAmount(debt > 0 ? debt : 0);
                              } else {
                                setNewPaymentAmount(0);
                              }
                            }}
                            required
                            className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                          >
                            <option value="">-- Choisir une dette en cours --</option>
                            {schools.map(s => {
                              const expectedTotal = s.studentCount * 1000;
                              const paidForMonth = payments
                                .filter(p => p.schoolId === s.id && p.month === newPaymentMonth)
                                .reduce((acc, p) => acc + p.amountPaid, 0);
                              const remaining = expectedTotal - paidForMonth;
                              return (
                                <option key={s.id} value={s.id} disabled={remaining <= 0}>
                                  {s.name} (Reste : {remaining > 0 ? remaining.toLocaleString('fr-FR') : '0'} FCFA)
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {newPaymentSchoolId && (() => {
                          const activeSchool = schools.find(sc => sc.id === newPaymentSchoolId);
                          if (!activeSchool) return null;
                          const expectedTotal = activeSchool.studentCount * 1000;
                          const paidForMonth = payments
                            .filter(p => p.schoolId === activeSchool.id && p.month === newPaymentMonth)
                            .reduce((acc, p) => acc + p.amountPaid, 0);
                          const remainingDebt = expectedTotal - paidForMonth;

                          return (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                              <p><span className="font-bold">Établissement:</span> {activeSchool.name}</p>
                              <p><span className="font-bold">Mois de facturation:</span> {newPaymentMonth}</p>
                              <p><span className="font-bold">Montant Initial Attendue:</span> {expectedTotal.toLocaleString('fr-FR')} FCFA</p>
                              <p><span className="font-bold">Déjà réglé ce mois:</span> {paidForMonth.toLocaleString('fr-FR')} FCFA</p>
                              <p className="text-amber-600 font-bold"><span className="font-bold">Dette restante à recouvrer:</span> {remainingDebt.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                          );
                        })()}

                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Montant du versement à enregistrer (FCFA) *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min={1}
                              value={newPaymentAmount || ''}
                              onChange={(e) => setNewPaymentAmount(Number(e.target.value))}
                              required
                              placeholder="Ex: 50000"
                              className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f] font-bold text-base"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const activeSchool = schools.find(sc => sc.id === newPaymentSchoolId);
                                if (activeSchool) {
                                  const expectedTotal = activeSchool.studentCount * 1000;
                                  const paidForMonth = payments
                                    .filter(p => p.schoolId === activeSchool.id && p.month === newPaymentMonth)
                                    .reduce((acc, p) => acc + p.amountPaid, 0);
                                  setNewPaymentAmount(expectedTotal - paidForMonth);
                                }
                              }}
                              className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 whitespace-nowrap"
                            >
                              Tout solder
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Entrez le montant de l'acompte ou du paiement intégral reçu pour cette dette.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Mois Concerné
                            </label>
                            <input
                              type="text"
                              value={newPaymentMonth}
                              readOnly
                              disabled
                              className="w-full bg-slate-100 text-slate-500 rounded-xl px-4 py-3 border border-slate-200 cursor-not-allowed text-xs font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Mode de paiement
                            </label>
                            <select
                              value={newPaymentMethod}
                              onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                              className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f] text-xs font-semibold"
                            >
                              <option value="Mobile Money">Mobile Money</option>
                              <option value="Virement">Virement</option>
                              <option value="Espèces">Espèces</option>
                              <option value="Chèque">Chèque</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Notes / Référence du transfert
                          </label>
                          <textarea
                            value={newPaymentNotes}
                            onChange={(e) => setNewPaymentNotes(e.target.value)}
                            placeholder="Ex: Reçu Wave, ID Orange Money #10293, règlement total..."
                            rows={2}
                            className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00236f] text-xs resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${pBg} ${pHover}`}
                        >
                          <Check className="w-5 h-5" />
                          <span>Enregistrer le Règlement</span>
                        </button>
                      </form>
                    </div>

                    {/* Right side: Schools lists with billing comparison and transactional history */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Comparison Table */}
                      <div className="bg-white rounded-[24px] border border-slate-200/80 overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-slate-150">
                          <h3 className="text-lg font-bold text-slate-800">
                            Situation Financière par Établissement
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Prévisionnel mensuel estimé par rapport aux versements reçus pour <strong className="text-slate-700">{newPaymentMonth}</strong>.
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                                <th className="py-3.5 px-4">Établissement</th>
                                <th className="py-3.5 px-4 text-center">Effectif</th>
                                <th className="py-3.5 px-4 text-right">Prévisionnel (1000F/élève)</th>
                                <th className="py-3.5 px-4 text-right">Payé</th>
                                <th className="py-3.5 px-4 text-center">Élèves en Règle</th>
                                <th className="py-3.5 px-4 text-right">Reste en attente</th>
                                <th className="py-3.5 px-4 text-center">Statut</th>
                                <th className="py-3.5 px-4 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                              {schools.map(school => {
                                // Calculate total forecast
                                const forecast = school.studentCount * 1000;
                                
                                // Sum paid for this school in this month
                                const schoolPayments = payments.filter(p => p.schoolId === school.id && p.month === newPaymentMonth);
                                const totalPaid = schoolPayments.reduce((acc, p) => acc + p.amountPaid, 0);
                                const paidStudents = schoolPayments.reduce((acc, p) => acc + p.paidStudentsCount, 0);
                                const remaining = forecast - totalPaid;

                                let statusBadge = 'Non payé';
                                let statusColor = 'bg-rose-50 text-rose-800 border-rose-200';
                                if (totalPaid >= forecast) {
                                  statusBadge = 'Payé';
                                  statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                } else if (totalPaid > 0) {
                                  statusBadge = 'Partiel';
                                  statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
                                }

                                return (
                                  <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                      <div className="font-bold text-slate-800">{school.name}</div>
                                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{school.type}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-semibold text-slate-600">
                                      {school.studentCount}
                                    </td>
                                    <td className="py-4 px-4 text-right font-bold text-slate-700">
                                      {forecast.toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td className="py-4 px-4 text-right font-extrabold text-emerald-600">
                                      {totalPaid.toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
                                        {paidStudents} / {school.studentCount}
                                      </span>
                                    </td>
                                    <td className={`py-4 px-4 text-right font-bold ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                      {remaining.toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusColor}`}>
                                        {statusBadge}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <button
                                        onClick={() => {
                                          setNewPaymentSchoolId(school.id);
                                          setNewPaymentAmount(remaining);
                                          triggerToast(`Saisie d'encaissement ouverte pour ${school.name}`, "info");
                                        }}
                                        className={`px-3 py-1 rounded-xl text-xs font-extrabold text-white transition-all shadow-xs ${pBg} ${pHover}`}
                                        title="Saisir paiement"
                                      >
                                        Saisir
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Transaction History of recorded payments */}
                      <div className="bg-white rounded-[24px] border border-slate-200/80 overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-slate-150">
                          <h3 className="text-lg font-bold text-slate-800">
                            Historique Récent des Paiements
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Liste complète des transactions validées par la direction administrative de ClassiNote.
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          {payments.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                              Aucun versement n'a encore été enregistré pour cette période.
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                                  <th className="py-3.5 px-4">Établissement</th>
                                  <th className="py-3.5 px-4">Période</th>
                                  <th className="py-3.5 px-4 text-right">Montant Réglé</th>
                                  <th className="py-3.5 px-4 text-center">Élèves couverts</th>
                                  <th className="py-3.5 px-4 text-center">Mode</th>
                                  <th className="py-3.5 px-4 text-center">Date</th>
                                  <th className="py-3.5 px-4">Notes & Réf</th>
                                  <th className="py-3.5 px-4 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm">
                                {payments.map((p) => (
                                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-700">
                                      {p.schoolName}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                                        {p.month}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                                      {p.amountPaid.toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                                      {p.paidStudentsCount} / {p.totalStudentsCount}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                        {p.paymentMethod}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                                      {p.datePaid}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate" title={p.notes}>
                                      {p.notes}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <button
                                        onClick={() => {
                                          setPayments(payments.filter(item => item.id !== p.id));
                                          triggerToast("Paiement supprimé de la base de données.", "info");
                                        }}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                        title="Supprimer cette transaction"
                                      >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        )}

      </main>

      {/* FOOTER contract - inside Main Page Wrapper */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className={`font-extrabold ${pText}`}>ClassiNote Systems © 2026</div>
          <div className="text-center md:text-left">
            Écosystème sécurisé d'administration et d'évaluation scolaire. Développé en conformité RGPD.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Mentions légales</a>
            <a href="#" className="hover:underline">Confidentialité</a>
            <a href="#" className="hover:underline">Sécurité</a>
          </div>
        </div>
      </footer>

      {/* Close MAIN PAGE WRAPPER */}
      </div>

      {/* --- Semantic Mobile Footer Tabbar (without Saisie) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center py-2 px-1 shadow-lg">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center p-2 text-[10px] transition-colors ${
            currentView === 'dashboard' ? `${pText} font-black` : 'text-slate-500'
          }`}
        >
          <School className="w-5 h-5 mb-0.5" />
          <span>Tableau</span>
        </button>

        <button 
          onClick={() => setCurrentView('schools')}
          className={`flex flex-col items-center justify-center p-2 text-[10px] transition-colors ${
            currentView === 'schools' ? `${pText} font-black` : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Écoles</span>
        </button>

        <button 
          onClick={() => setCurrentView('import')}
          className={`flex flex-col items-center justify-center p-2 text-[10px] transition-colors ${
            currentView === 'import' ? `${pText} font-black` : 'text-slate-500'
          }`}
        >
          <UploadCloud className="w-5 h-5 mb-0.5" />
          <span>Import</span>
        </button>

        <button 
          onClick={() => setCurrentView('queue')}
          className={`flex flex-col items-center justify-center p-2 text-[10px] transition-colors relative ${
            currentView === 'queue' ? `${pText} font-black` : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>Queue</span>
          {pendingGradesSubmissions > 0 && (
            <span className="absolute top-1.5 right-2 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
              {pendingGradesSubmissions}
            </span>
          )}
        </button>
      </nav>

      {/* --- PHOTO COPIES ZOOM MODAL --- */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setZoomModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:opacity-75 transition-opacity"
              title="Fermer"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="w-full flex-grow overflow-auto rounded-2xl bg-white p-2 shadow-2xl border border-slate-100">
              <img 
                src={selectedGradingSession.copies[selectedCopyIndex]} 
                alt="Zoom copie" 
                className="max-h-[80vh] mx-auto object-contain rounded-xl select-none"
              />
            </div>
            <div className="text-center text-white text-xs font-semibold mt-4">
              Page {selectedCopyIndex + 1} de {selectedGradingSession.teacherName} ({selectedGradingSession.subject})
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
