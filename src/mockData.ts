export interface SchoolItem {
  id: string;
  name: string;
  type: 'Maternelle' | 'Primaire' | 'Collège' | 'Lycée';
  address: string;
  adminName: string;
  adminEmail: string;
  status: 'Actives' | 'Suspendues';
  studentCount: number;
}

export interface PaymentItem {
  id: string;
  schoolId: string;
  schoolName: string;
  month: string; // e.g., "Août 2026", "Septembre 2026"
  amountPaid: number; // Collected amount
  paidStudentsCount: number; // Number of students who paid
  totalStudentsCount: number; // Total students in school at that time
  ratePerStudent: number; // 1000 FCFA usually
  datePaid: string;
  paymentMethod: 'Mobile Money' | 'Espèces' | 'Virement' | 'Chèque';
  notes?: string;
}

export interface ActivityItem {
  id: string;
  type: 'creation' | 'import' | 'update' | 'suspension' | 'system';
  title: string;
  time: string;
  schoolName?: string;
  icon?: string;
}

export interface StudentGrade {
  id: string;
  name: string;
  grade: string; // can be empty or decimal string
  status: 'completed' | 'pending';
}

export interface GradingSession {
  id: string;
  teacherName: string;
  teacherAvatar: string;
  subject: string;
  className: string;
  copyCount: number;
  submittedTime: string;
  status: 'En attente' | 'Traité';
  copies: string[];
  students: StudentGrade[];
}

export const initialSchools: SchoolItem[] = [
  {
    id: '1',
    name: 'École Primaire Les Lilas',
    type: 'Primaire',
    address: "123 Rue de l'Éducation, Paris",
    adminName: 'Jean Dupont',
    adminEmail: 'jean.dupont@leslilas.fr',
    status: 'Actives',
    studentCount: 320,
  },
  {
    id: '2',
    name: 'Institution Saint-Exupéry',
    type: 'Collège',
    address: '45 Avenue des Écoles, Lyon',
    adminName: 'Marie Curie',
    adminEmail: 'm.curie@st-exupery.fr',
    status: 'Actives',
    studentCount: 680,
  },
  {
    id: '3',
    name: 'Groupe Scolaire Jean Moulin',
    type: 'Collège',
    address: '12 Rue du Collège, Marseille',
    adminName: 'Albert Einstein',
    adminEmail: 'a.einstein@jeanmoulin.fr',
    status: 'Actives',
    studentCount: 845,
  },
  {
    id: '4',
    name: 'Lycée Moderne',
    type: 'Lycée',
    address: '89 Boulevard Jules Verne, Nantes',
    adminName: 'Simone de Beauvoir',
    adminEmail: 's.beauvoir@lyceemoderne.fr',
    status: 'Actives',
    studentCount: 1120,
  },
  {
    id: '5',
    name: 'Sainte-Marie Academy',
    type: 'Primaire',
    address: "40 Rue de l'Académie, Bordeaux",
    adminName: 'Charles de Gaulle',
    adminEmail: 'c.degaulle@saintemarie.fr',
    status: 'Actives',
    studentCount: 450,
  }
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'creation',
    title: 'Nouvelle école créée: Lycée Moderne',
    time: 'Il y a 2 heures',
    schoolName: 'Lycée Moderne'
  },
  {
    id: 'act-2',
    type: 'import',
    title: 'Importation réussie: Sainte-Marie Academy',
    time: 'Hier, 14:30',
    schoolName: 'Sainte-Marie Academy'
  },
  {
    id: 'act-3',
    type: 'update',
    title: 'Mise à jour des droits admin: Collège Jean Moulin',
    time: 'Hier, 09:15',
    schoolName: 'Groupe Scolaire Jean Moulin'
  },
  {
    id: 'act-4',
    type: 'suspension',
    title: 'Suspension temporaire: École Primaire Les Lilas',
    time: '20 Mars, 16:45',
    schoolName: 'École Primaire Les Lilas'
  },
  {
    id: 'act-5',
    type: 'system',
    title: 'Mise à jour du système global (v2.4)',
    time: '19 Mars, 02:00'
  }
];

export const initialGradingQueue: GradingSession[] = [
  {
    id: 'sess-1',
    teacherName: 'Mme. Dubois Sophie',
    teacherAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpX5av0Yi_w2zYdYnU88YyJA96_VQbcaVZAzQlq555HCCDrudCJYLMih6zTLGWOdxBdYQO-C6rNsw6cICDeKK5kElmGaPN8076KU15H6rcGJcqnuk0w-YmBT-WL2CHFZHI50hS5LneO7q72PNy83ttGjWuQMC1OaBlPH1aheGyOOqR1Aiq6eVw3_w7ehSRFXIL1OgE0jgDKZXwMGdjDVsL3EXy646ouFN8QALQDfSHP0nl-zKUTxICbw',
    subject: 'Mathématiques',
    className: 'Terminale S3',
    copyCount: 32,
    submittedTime: 'Soumis le 24 Oct, 09:15',
    status: 'En attente',
    copies: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAs32DwvlTGZcJPDlNm-zcTuNA41j2m6tPn8Gb5kQTgORQ52hCT2H6OLeqtX1kPzS8m_c9J_QZXk3mZfXF8KWfNAlln28OZ6v48-MpJuWe4XeEGKSFdraWWGD2nsCrwIDDqpkazWDvUz3cbilCnHibHlYw9MrvuZ1rlFX1JzQz0KKTGwY48sW4dLBQ0rEY8AS-AK11yhKsvF3sazBGqMY5CTn7MhZ_UVqcsK0wkDZje49O50ejmXQZYWg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEPLh8908cUoNhuHdjWt3y4HnWF4usMngEefDF7_kfNrzJMFs1IYWeD680ito9MsbsjN-XkuYn_Epud7uAZP5JENeWKkajqeAnIj1KKA9L_vvzGWImJLas5BdGTrZLfFoWWuQTMEH54nQJxbnZ4bmMj1Yua5mtsR-nSpPUxdJ0rhZqwmrchKwYwPzXf5-mPeObZ600kKRCRYPxZca8Y97BJEIw3DvNE90Unkv6ZdSulUkUfwAAZuDdEg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrTo44YMkbw1C_P7raRrX0F6Tc-1L6lwbsmfK_mFvM-oxoeA2CGGOAh4GQQpz-wgriigWpzrkxhpgZWVTyikJjrtEdSToGDhHUm0UdRLazs4w0p3tEtYswqNCjkGzYky0cac7XCZE5jXGIsLdLyoVJhEqzEUlOw6XDXPnORU4HBV2SKR0PZMB-K1H3CNHWrbx_Z0JQ1XfRdbzkjshqRdJ4B5vX9PgOtB1e51f8W8QPY-pa6p3uzy6jFA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCCKjizUdD3VZOVwzOMc0EJEqmkZ2H87TaCwjaX2MruqvhbwW0jNwrMyxj4RQBkoc0TiJEXB-TyuevnNud--GDj_QL_FRuXupYkFwRFK116fmr9qWP5wUkqgl3q-7dNunZ3uREdOwW2WCS1nhWEVBo0H8BzrMJSPKJXJATb1uS46t5ZV08PueL_XCPYzmO1k2gpzgf8txZm6vwTmZwk0QPwE-eutVaIh6GtfkXEnV0jDtyNyHWnO_tzw'
    ],
    students: [
      { id: 'stud-1', name: 'Dubois, Alice', grade: '15.5', status: 'completed' },
      { id: 'stud-2', name: 'Martin, Lucas', grade: '12.0', status: 'completed' },
      { id: 'stud-3', name: 'Petit, Emma', grade: '', status: 'pending' },
      { id: 'stud-4', name: 'Roux, Thomas', grade: '', status: 'pending' }
    ]
  },
  {
    id: 'sess-2',
    teacherName: 'M. Martin Laurent',
    teacherAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeP3EL0dLtH_2Xb7dvsrbyV40Z-Clu9YaDqXEuxlpDbj51luFtyXpAcHvJ7sBdCJAS4neIEbT4fPSnGTKPKYahR9UX6Cqhni_4PPOZtyQTPhywStNKFtW_mRKVBIiiKwg081C8F4hRKBzPceIH3358TTIoTJKt7QWqJAefqYHxWu9Xp_NfScFtr0ijrHcUfpNvXN8pSK6Pci9Cen0PK1bc492DNk7Bhy9S_cpoBNxgTeX0DPfB_hHzSA',
    subject: 'Histoire-Géo',
    className: 'Classe: 3ème B',
    copyCount: 28,
    submittedTime: 'Soumis le 24 Oct, 08:30',
    status: 'Traité',
    copies: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrTo44YMkbw1C_P7raRrX0F6Tc-1L6lwbsmfK_mFvM-oxoeA2CGGOAh4GQQpz-wgriigWpzrkxhpgZWVTyikJjrtEdSToGDhHUm0UdRLazs4w0p3tEtYswqNCjkGzYky0cac7XCZE5jXGIsLdLyoVJhEqzEUlOw6XDXPnORU4HBV2SKR0PZMB-K1H3CNHWrbx_Z0JQ1XfRdbzkjshqRdJ4B5vX9PgOtB1e51f8W8QPY-pa6p3uzy6jFA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCCKjizUdD3VZOVwzOMc0EJEqmkZ2H87TaCwjaX2MruqvhbwW0jNwrMyxj4RQBkoc0TiJEXB-TyuevnNud--GDj_QL_FRuXupYkFwRFK116fmr9qWP5wUkqgl3q-7dNunZ3uREdOwW2WCS1nhWEVBo0H8BzrMJSPKJXJATb1uS46t5ZV08PueL_XCPYzmO1k2gpzgf8txZm6vwTmZwk0QPwE-eutVaIh6GtfkXEnV0jDtyNyHWnO_tzw'
    ],
    students: [
      { id: 'stud-5', name: 'Bernard, Clara', grade: '18.0', status: 'completed' },
      { id: 'stud-6', name: 'Guerin, Louis', grade: '14.5', status: 'completed' },
      { id: 'stud-7', name: 'Leclerc, Sophie', grade: '11.0', status: 'completed' },
      { id: 'stud-8', name: 'Moreau, Gabriel', grade: '16.0', status: 'completed' }
    ]
  },
  {
    id: 'sess-3',
    teacherName: 'Mme. Leroy Alice',
    teacherAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpX5av0Yi_w2zYdYnU88YyJA96_VQbcaVZAzQlq555HCCDrudCJYLMih6zTLGWOdxBdYQO-C6rNsw6cICDeKK5kElmGaPN8076KU15H6rcGJcqnuk0w-YmBT-WL2CHFZHI50hS5LneO7q72PNy83ttGjWuQMC1OaBlPH1aheGyOOqR1Aiq6eVw3_w7ehSRFXIL1OgE0jgDKZXwMGdjDVsL3EXy646ouFN8QALQDfSHP0nl-zKUTxICbw',
    subject: 'Physique',
    className: 'Classe: 4ème C',
    copyCount: 25,
    submittedTime: 'Soumis le 23 Oct, 16:45',
    status: 'En attente',
    copies: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEPLh8908cUoNhuHdjWt3y4HnWF4usMngEefDF7_kfNrzJMFs1IYWeD680ito9MsbsjN-XkuYn_Epud7uAZP5JENeWKkajqeAnIj1KKA9L_vvzGWImJLas5BdGTrZLfFoWWuQTMEH54nQJxbnZ4bmMj1Yua5mtsR-nSpPUxdJ0rhZqwmrchKwYwPzXf5-mPeObZ600kKRCRYPxZca8Y97BJEIw3DvNE90Unkv6ZdSulUkUfwAAZuDdEg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAs32DwvlTGZcJPDlNm-zcTuNA41j2m6tPn8Gb5kQTgORQ52hCT2H6OLeqtX1kPzS8m_c9J_QZXk3mZfXF8KWfNAlln28OZ6v48-MpJuWe4XeEGKSFdraWWGD2nsCrwIDDqpkazWDvUz3cbilCnHibHlYw9MrvuZ1rlFX1JzQz0KKTGwY48sW4dLBQ0rEY8AS-AK11yhKsvF3sazBGqMY5CTn7MhZ_UVqcsK0wkDZje49O50ejmXQZYWg'
    ],
    students: [
      { id: 'stud-9', name: 'Faure, Lucas', grade: '', status: 'pending' },
      { id: 'stud-10', name: 'Lambert, Maxime', grade: '', status: 'pending' },
      { id: 'stud-11', name: 'Rousseau, Lea', grade: '', status: 'pending' },
      { id: 'stud-12', name: 'Michel, Arthur', grade: '', status: 'pending' }
    ]
  }
];

export const initialPayments: PaymentItem[] = [
  {
    id: 'pay-1',
    schoolId: '1',
    schoolName: 'École Primaire Les Lilas',
    month: 'Août 2026',
    amountPaid: 180000,
    paidStudentsCount: 180,
    totalStudentsCount: 320,
    ratePerStudent: 1000,
    datePaid: '15 Août 2026',
    paymentMethod: 'Mobile Money',
    notes: 'Acompte partiel reçu par Wave'
  },
  {
    id: 'pay-2',
    schoolId: '2',
    schoolName: 'Institution Saint-Exupéry',
    month: 'Août 2026',
    amountPaid: 680000,
    paidStudentsCount: 680,
    totalStudentsCount: 680,
    ratePerStudent: 1000,
    datePaid: '10 Août 2026',
    paymentMethod: 'Virement',
    notes: 'Règlement total reçu par virement bancaire'
  },
  {
    id: 'pay-3',
    schoolId: '3',
    schoolName: 'Groupe Scolaire Jean Moulin',
    month: 'Août 2026',
    amountPaid: 400000,
    paidStudentsCount: 400,
    totalStudentsCount: 845,
    ratePerStudent: 1000,
    datePaid: '18 Août 2026',
    paymentMethod: 'Chèque',
    notes: 'Premier chèque encaissé'
  },
  {
    id: 'pay-4',
    schoolId: '5',
    schoolName: 'Sainte-Marie Academy',
    month: 'Août 2026',
    amountPaid: 350000,
    paidStudentsCount: 350,
    totalStudentsCount: 450,
    ratePerStudent: 1000,
    datePaid: '20 Août 2026',
    paymentMethod: 'Mobile Money',
    notes: 'Reçu Orange Money'
  }
];
