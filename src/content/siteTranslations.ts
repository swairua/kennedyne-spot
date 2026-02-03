import { SiteContent } from './siteContent';

type DeepPartial<T> = T extends (infer U)[] 
  ? DeepPartial<U>[] 
  : T extends object 
  ? { [K in keyof T]?: DeepPartial<T[K]> } 
  : T;

export const siteTranslations: Record<'en'|'fr'|'es'|'de'|'ru', DeepPartial<SiteContent>> = {
  en: {},
  fr: {
    hero: {
      badge: 'TRADING FOREX ÉDUCATIF EN PRIORITÉ',
      headline: 'Apprenez les Concepts de Trading Institutionnels avec la Stratégie Structurée <span class="text-primary">DRIVE</span>',
      subheadline: 'Accédez aux ressources éducatives de trading, à la formation en analyse de marché et à nos stratégies basées sur les institutions lorsque vous vous inscrivez auprès de notre courtier recommandé via notre partenaire <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer" class="underline text-primary font-semibold">exness</a>.',
      cta1: 'Commencer à Apprendre',
      cta2: 'Voir Comment DRIVE Fonctionne',
      trustStrip: 'Méthodologie éprouvée | Éducation réelle | Pas de fausses promesses',
    },
    services: {
      title: 'Nos Services Éducatifs',
      subtitle: 'Formation complète au trading axée sur le développement de compétences réelles, sans fausses promesses',
      items: [
        {
          title: 'Formation Stratégie DRIVE',
          description: 'Apprenez notre approche systématique en 5 étapes pour l\'analyse de marché et l\'exécution des trades avec une gestion appropriée des risques.',
        },
        {
          title: 'Mentorat Individuel',
          description: 'Accompagnement personnel pour développer votre psychologie de trading, votre discipline et votre compréhension de la structure du marché.',
        },
        {
          title: 'Focus Gestion des Risques',
          description: 'Maîtrisez le dimensionnement de position, les stop loss et la préservation du capital—la base du trading durable.',
        },
      ],
    },
    howItWorks: {
      title: 'Comment Ça Marche',
      subtitle: 'Commencez en quelques minutes et débloquez des avantages de trading de niveau institutionnel entièrement gratuits',
      steps: [
        {
          title: 'Inscrivez-vous sur Exness',
          description: 'Cliquez sur notre bouton ci-dessous pour créer votre compte Exness gratuit via notre lien d\'affiliation. Cela ne prend que 2 minutes. Complétez également la vérification d\'identité et de résidence.',
          features: [
            'Plusieurs types de comptes de détail, dépôt minimum faible de 10 $, effet de levier élevé flexible, retraits instantanés sans frais et diverses options de paiement.',
          ],
        },
        {
          title: 'Alimentez Votre Compte',
          description: 'Effectuez votre dépôt initial pour activer votre compte. Choisissez un montant qui correspond à vos objectifs de capital de trading.',
        },
        {
          title: 'Envoyez Votre ID de Compte',
          description: 'Une fois inscrit, envoyez-nous votre ID de compte Exness afin que nous puissions vérifier votre inscription et activer vos avantages.',
        },
        {
          title: 'Débloquez Tout Gratuitement',
          description: 'Recevez instantanément l\'accès aux signaux premium, au mentorat individuel et à la formation complète sur la stratégie DRIVE.',
        },
      ],
    },
    testimonials: {
      title: 'Que Disent les Apprenants ?',
      subtitle: 'Retours de notre communauté d\'apprenants dévoués',
      items: [
        {
          name: 'James M.',
          role: 'Nairobi, Kenya',
          content: 'Les leçons structurées m\'ont aidé à comprendre les concepts de trading plus clairement. Les sessions de mentorat ont expliqué le raisonnement derrière différentes configurations de marché.',
        },
        {
          name: 'Lerato P.',
          role: 'Johannesburg, Afrique du Sud',
          content: 'Faire partie de la communauté Traders in the Zone me maintient motivé. Les discussions encouragent la collaboration et l\'apprentissage partagé.',
        },
        {
          name: 'Emeka O.',
          role: 'Lagos, Nigeria',
          content: 'J\'apprécie l\'équilibre entre orientation et éducation. Cela m\'aide à renforcer ma confiance dans le développement de ma propre approche de trading.',
        },
      ],
      disclaimer: 'Ces témoignages reflètent des expériences d\'apprentissage individuelles. Les résultats de trading varient et les performances passées ne garantissent pas le succès futur.',
    },
    transformCTA: {
      title: 'Prêt à Transformer Votre Trading ?',
      subtitle: 'Rejoignez des centaines de traders qui développent de vraies compétences grâce à une éducation systématique et à des principes appropriés de gestion des risques.',
      stats: [
        { value: '500+', label: 'Étudiants Formés' },
        { value: '200+', label: 'Leçons Dispensées' },
        { value: '24/7', label: 'Support Éducatif' },
      ],
      button: { text: 'Commencer l\'Éducation', href: '/services/learn' },
    },
    finalCTA: {
      title: 'Prêt à Apprendre le Trading Professionnel ?',
      subtitle: 'Commencez votre éducation systématique au trading avec des méthodes éprouvées et des attentes réalistes.',
      button: { text: 'Commencer à Apprendre', href: '/services/learn' },
      benefits: [
        'Approche éducation-prioritaire',
        'Parcours d\'apprentissage structuré',
        'Méthodologie DRIVE complète',
        'Focus sur la gestion des risques',
        'Support de mentorat continu',
      ],
    },
    blogPreview: {
      title: 'Blog d\'Éducation au Trading',
      subtitle: 'Apprenez les concepts de trading institutionnels à travers notre contenu éducatif structuré',
    },
    newsletter: {
      title: 'Notes de Marché Hebdomadaires',
      subtitle: 'Configurations, erreurs dont nous apprenons et listes de contrôle livrées dans votre boîte de réception chaque dimanche',
    },
    pages: {
      driveStrategy: {
        title: 'La Stratégie DRIVE',
        subtitle: 'Notre approche systématique de l’analyse de marché forex et de la prise de décision',
        content: 'Apprenez notre méthodologie DRIVE complète pour une analyse de marché cohérente.'
      }
    },
  },
  es: {
    seo: {
      title: 'KenneDyne spot | Educación Profesional de Forex y Estrategia DRIVE',
      description: 'Domina los conceptos de trading institucional con nuestro programa educativo estructurado y marco DRIVE comprobado. Mentoría profesional de forex, gestión de riesgos y educación sistemática de trading.',
      keywords: 'educación de trading institucional, mentoría de forex, estrategia DRIVE, psicología de trading, gestión de riesgos, conceptos smart money, educación de forex Kenia'
    },
    navigation: {
      links: [
        { name: "Inicio", href: "/" },
        { name: "Estrategia DRIVE", href: "/strategy" },
        { name: "Servicios", href: "/services" },
        { name: "Recursos", href: "/resources" },
        { name: "Blog", href: "/blog" },
        { name: "Preguntas Frecuentes", href: "/faqs" },
        { name: "Contacto", href: "/contact" }
      ]
    },
    hero: {
      badge: 'TRADING FOREX EDUCATIVO PRIMERO',
      headline: 'Aprende Conceptos de Trading Institucional con la Estrategia Estructurada <span class="text-primary">DRIVE</span>',
      subheadline: 'Accede a recursos educativos de trading, capacitación en análisis de mercado y nuestras estrategias basadas en instituciones cuando te registres con nuestro broker recomendado a través de nuestro socio <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer" class="underline text-primary font-semibold">exness</a>.',
      cta1: 'Comenzar a Aprender',
      cta2: 'Ver Cómo Funciona DRIVE',
      trustStrip: 'Metodología probada | Educación real | Sin falsas promesas',
    },
    services: {
      title: 'Nuestros Servicios Educativos',
      subtitle: 'Educación completa de trading enfocada en construir habilidades reales, sin falsas promesas',
      items: [
        {
          title: 'Formación en Estrategia DRIVE',
          description: 'Aprende nuestro enfoque sistemático de 5 pasos para análisis de mercado y ejecución de operaciones con gestión adecuada de riesgo.',
        },
        {
          title: 'Mentoría Individual',
          description: 'Orientación personal para desarrollar tu psicología de trading, disciplina y comprensión de estructura de mercado.',
        },
        {
          title: 'Enfoque en Gestión de Riesgo',
          description: 'Domina el tamaño de posición, stop losses y preservación de capital—la base del trading sostenible.',
        },
      ],
    },
    howItWorks: {
      title: 'Cómo Funciona',
      subtitle: 'Comienza en minutos y desbloquea beneficios de trading de nivel institucional completamente gratis',
      steps: [
        {
          title: 'Regístrate en Exness',
          description: 'Haz clic en nuestro botón abajo para crear tu cuenta gratuita de Exness a través de nuestro enlace de afiliado. Solo toma 2 minutos. También, completa la verificación de identidad y residencia.',
          features: [
            'Múltiples tipos de cuentas minoristas, depósito mínimo bajo de $10, apalancamiento flexible alto, retiros instantáneos sin comisiones y varias opciones de pago.',
          ],
        },
        {
          title: 'Deposita en Tu Cuenta',
          description: 'Haz tu depósito inicial para activar tu cuenta. Elige cualquier cantidad que se ajuste a tus objetivos de capital de trading.',
        },
        {
          title: 'Envía Tu ID de Cuenta',
          description: 'Una vez registrado, envíanos tu ID de cuenta de Exness para que podamos verificar tu registro y activar tus beneficios.',
        },
        {
          title: 'Desbloquea Todo Gratis',
          description: 'Recibe instantáneamente acceso a señales premium, mentoría 1-a-1 y formación completa en la estrategia DRIVE.',
        },
      ],
    },
    testimonials: {
      title: '¿Qué Dicen los Estudiantes?',
      subtitle: 'Comentarios de nuestra comunidad de estudiantes dedicados',
      items: [
        {
          name: 'James M.',
          role: 'Nairobi, Kenia',
          content: 'Las lecciones estructuradas me ayudaron a comprender los conceptos de trading con mayor claridad. Las sesiones de mentoría explicaron el razonamiento detrás de diferentes configuraciones de mercado.',
        },
        {
          name: 'Lerato P.',
          role: 'Johannesburgo, Sudáfrica',
          content: 'Ser parte de la comunidad Traders in the Zone me mantiene motivado. Las discusiones fomentan la colaboración y el aprendizaje compartido.',
        },
        {
          name: 'Emeka O.',
          role: 'Lagos, Nigeria',
          content: 'Aprecio el equilibrio entre orientación y educación. Me está ayudando a construir confianza en el desarrollo de mi propio enfoque de trading.',
        },
      ],
      disclaimer: 'Estos testimonios reflejan experiencias de aprendizaje individuales. Los resultados de trading varían y el rendimiento pasado no garantiza el éxito futuro.',
    },
    transformCTA: {
      title: '¿Listo para Transformar Tu Trading?',
      subtitle: 'Únete a cientos de traders construyendo habilidades reales a través de educación sistemática y principios adecuados de gestión de riesgo.',
      stats: [
        { value: '500+', label: 'Estudiantes Educados' },
        { value: '200+', label: 'Lecciones Impartidas' },
        { value: '24/7', label: 'Soporte Educativo' },
      ],
      button: { text: 'Comenzar Educación', href: '/services/learn' },
    },
    finalCTA: {
      title: '¿Listo para Aprender Trading Profesional?',
      subtitle: 'Comienza tu educación sistemática de trading con métodos probados y expectativas realistas.',
      button: { text: 'Comenzar a Aprender', href: '/services/learn' },
      benefits: [
        'Enfoque educativo primero',
        'Ruta de aprendizaje estructurada',
        'Metodología DRIVE completa',
        'Enfoque en gestión de riesgo',
        'Soporte de mentoría continuo',
      ],
    },
    blogPreview: {
      title: 'Blog de Educación de Trading',
      subtitle: 'Aprende conceptos de trading institucional a través de nuestro contenido educativo estructurado',
    },
    newsletter: {
      title: 'Notas Semanales del Mercado',
      subtitle: 'Setups, errores de los que estamos aprendiendo y listas de verificación enviadas a tu correo cada domingo',
    },
    pages: {
      driveStrategy: {
        title: 'La Estrategia DRIVE',
        subtitle: 'Nuestro enfoque sistemático para el análisis del mercado forex y la toma de decisiones de trading',
        content: 'Aprende nuestra metodología DRIVE completa para un análisis de mercado consistente.'
      }
    },
  },
  de: {
    seo: {
      title: 'KenneDyne spot | Professionelle Forex-Ausbildung & DRIVE-Strategie',
      description: 'Meistern Sie institutionelle Trading-Konzepte mit unserem strukturierten Bildungsprogramm und bewährtem DRIVE-Rahmen. Professionelles Forex-Mentoring, Risikomanagement und systematische Trading-Ausbildung.',
      keywords: 'institutionelle Trading-Ausbildung, Forex-Mentoring, DRIVE-Strategie, Trading-Psychologie, Risikomanagement, Smart-Money-Konzepte, Forex-Ausbildung Kenia'
    },
    navigation: {
      links: [
        { name: "Startseite", href: "/" },
        { name: "DRIVE Strategie", href: "/strategy" },
        { name: "Dienstleistungen", href: "/services" },
        { name: "Ressourcen", href: "/resources" },
        { name: "Blog", href: "/blog" },
        { name: "FAQs", href: "/faqs" },
        { name: "Kontakt", href: "/contact" }
      ]
    },
    hero: {
      badge: 'BILDUNGSORIENTIERTES FOREX-TRADING',
      headline: 'Lernen Sie Institutionelle Trading-Konzepte mit der Strukturierten <span class="text-primary">DRIVE</span>-Strategie',
      subheadline: 'Zugang zu Bildungsressourcen für das Trading, Schulung zur Marktanalyse und unseren institutionell basierten Strategien, wenn Sie sich bei unserem empfohlenen Broker über unseren Partner <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer" class="underline text-primary font-semibold">exness</a> anmelden.',
      cta1: 'Jetzt Lernen Beginnen',
      cta2: 'Sehen, Wie DRIVE Funktioniert',
      trustStrip: 'Bewährte Methodik | Echte Bildung | Keine falschen Versprechungen',
    },
    services: {
      title: 'Unsere Bildungsdienstleistungen',
      subtitle: 'Umfassende Trading-Ausbildung mit Fokus auf echte Fähigkeiten, keine falschen Versprechungen',
      items: [
        {
          title: 'DRIVE-Strategie-Training',
          description: 'Lernen Sie unseren systematischen 5-Schritte-Ansatz für Marktanalyse und Trade-Ausführung mit angemessenem Risikomanagement.',
        },
        {
          title: '1-zu-1 Mentoring',
          description: 'Persönliche Anleitung zur Entwicklung Ihrer Trading-Psychologie, Disziplin und des Verständnisses von Marktstrukturen.',
        },
        {
          title: 'Risikomanagement-Fokus',
          description: 'Beherrschen Sie Positionsgröße, Stop-Losses und Kapitalerhaltung—die Grundlage nachhaltigen Tradings.',
        },
      ],
    },
    howItWorks: {
      title: 'Wie Es Funktioniert',
      subtitle: 'Starten Sie in Minuten und schalten Sie Trading-Vorteile auf institutionellem Niveau völlig kostenlos frei',
      steps: [
        {
          title: 'Bei Exness Registrieren',
          description: 'Klicken Sie auf unseren Button unten, um Ihr kostenloses Exness-Konto über unseren Affiliate-Link zu erstellen. Es dauert nur 2 Minuten. Schließen Sie auch die Identitäts- und Wohnsitzverifizierung ab.',
          features: [
            'Mehrere Retail-Kontotypen, niedriges $10 Mindesteinzahlung, flexibles hohes Leverage, sofortige gebührenfreie Auszahlungen und verschiedene Zahlungsoptionen.',
          ],
        },
        {
          title: 'Konto Aufladen',
          description: 'Tätigen Sie Ihre erste Einzahlung, um Ihr Konto zu aktivieren. Wählen Sie einen Betrag, der zu Ihren Trading-Kapitalzielen passt.',
        },
        {
          title: 'Konto-ID Senden',
          description: 'Nachdem Sie sich registriert haben, senden Sie uns Ihre Exness-Konto-ID, damit wir Ihre Registrierung verifizieren und Ihre Vorteile aktivieren können.',
        },
        {
          title: 'Alles Kostenlos Freischalten',
          description: 'Erhalten Sie sofortigen Zugang zu Premium-Signalen, 1-zu-1-Mentoring und vollständigem DRIVE-Strategie-Training.',
        },
      ],
    },
    testimonials: {
      title: 'Was Sagen Lernende?',
      subtitle: 'Feedback von unserer Gemeinschaft engagierter Lernender',
      items: [
        {
          name: 'James M.',
          role: 'Nairobi, Kenia',
          content: 'Die strukturierten Lektionen halfen mir, Trading-Konzepte klarer zu verstehen. Die Mentoring-Sitzungen erklärten die Gründe hinter verschiedenen Markt-Setups.',
        },
        {
          name: 'Lerato P.',
          role: 'Johannesburg, Südafrika',
          content: 'Teil der Traders in the Zone-Community zu sein, hält mich motiviert. Die Diskussionen fördern Zusammenarbeit und gemeinsames Lernen.',
        },
        {
          name: 'Emeka O.',
          role: 'Lagos, Nigeria',
          content: 'Ich schätze die Balance zwischen Anleitung und Bildung. Es hilft mir, Vertrauen in die Entwicklung meines eigenen Trading-Ansatzes aufzubauen.',
        },
      ],
      disclaimer: 'Diese Testimonials spiegeln individuelle Lernerfahrungen wider. Trading-Ergebnisse variieren und vergangene Performance garantiert keinen zukünftigen Erfolg.',
    },
    transformCTA: {
      title: 'Bereit, Ihr Trading Zu Transformieren?',
      subtitle: 'Schließen Sie sich Hunderten von Tradern an, die echte Fähigkeiten durch systematische Ausbildung und angemessene Risikomanagementprinzipien aufbauen.',
      stats: [
        { value: '500+', label: 'Ausgebildete Studenten' },
        { value: '200+', label: 'Gelehrte Lektionen' },
        { value: '24/7', label: 'Bildungsunterstützung' },
      ],
      button: { text: 'Bildung Beginnen', href: '/services/learn' },
    },
    finalCTA: {
      title: 'Bereit, Professionelles Trading Zu Lernen?',
      subtitle: 'Beginnen Sie Ihre systematische Trading-Ausbildung mit bewährten Methoden und realistischen Erwartungen.',
      button: { text: 'Jetzt Lernen Beginnen', href: '/services/learn' },
      benefits: [
        'Bildung-zuerst-Ansatz',
        'Strukturierter Lernpfad',
        'Vollständige DRIVE-Methodik',
        'Risikomanagement-Fokus',
        'Fortlaufende Mentoring-Unterstützung',
      ],
    },
    blogPreview: {
      title: 'Trading-Bildungs-Blog',
      subtitle: 'Lernen Sie institutionelle Trading-Konzepte durch unsere strukturierten Bildungsinhalte',
    },
    newsletter: {
      title: 'Wöchentliche Marktnotizen',
      subtitle: 'Setups, Fehler aus denen wir lernen und Checklisten jeden Sonntag in Ihrem Posteingang',
    },
    pages: {
      driveStrategy: {
        title: 'Die DRIVE-Strategie',
        subtitle: 'Unser systematischer Ansatz für Forex-Marktanalyse und Handelsentscheidungen',
        content: 'Lernen Sie unsere vollständige DRIVE-Methodik für eine konsistente Marktanalyse.'
      }
    },
  },
  ru: {
    seo: {
      title: 'KenneDyne spot | Профессиональное Обучение Форекс и Стратегия DRIVE',
      description: 'Освойте институциональные торговые концепции с нашей структурированной образовательной программой и проверенной системой DRIVE. Профессиональное наставничество ��орекс, управление рисками и систематическое торговое образование.',
      keywords: 'институциональное торговое образование, наставничество форекс, стратегия DRIVE, психология трейдинга, управление рисками, концепции умных денег, обучение форекс Кения'
    },
    navigation: {
      links: [
        { name: "Главная", href: "/" },
        { name: "Стратегия DRIVE", href: "/strategy" },
        { name: "Услуги", href: "/services" },
        { name: "Ресурсы", href: "/resources" },
        { name: "Блог", href: "/blog" },
        { name: "Вопросы", href: "/faqs" },
        { name: "Контакты", href: "/contact" }
      ]
    },
    hero: {
      badge: 'ОБРАЗОВАТЕЛЬНЫЙ FOREX ТРЕЙДИНГ ПРЕЖДЕ ВСЕГО',
      headline: 'Изучите Институциональные Торговые Концепции со Структурированной Стратегией <span class="text-primary">DRIVE</span>',
      subheadline: 'Доступ к образовательным торговым ресурсам, обучению анализу рынка и нашим стратегиям институционального уровня при регистрации с нашим рекомендуемым брокером через нашего партнера <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer" class="underline text-primary font-semibold">exness</a>.',
      cta1: 'Начать Обучение',
      cta2: 'Узнать, Как Работает DRIVE',
      trustStrip: 'Проверенная методология | Реальное образование | Никаких ложных обещаний',
    },
    services: {
      title: 'Наши Образовательные Услуги',
      subtitle: 'Комплексное торговое образование, сосредоточенное на построении реальных навыков, без ложных обещаний',
      items: [
        {
          title: 'Обучение Стратегии DRIVE',
          description: 'Изучите наш систематический 5-шаговый подход к анализу рынка и исполнению сделок с надлежащим управлением рисками.',
        },
        {
          title: 'Индивидуальное Наставничество',
          description: 'Персональное руководство для развития вашей торговой психологии, дисциплины и понимания рыночной структуры.',
        },
        {
          title: 'Фокус на Уп��авлении Рисками',
          description: 'Освойте размер позиции, стоп-лоссы и сохранение капитала—основу устойчивого трейдинга.',
        },
      ],
    },
    howItWorks: {
      title: 'Как Это Работает',
      subtitle: 'Начните за минуты и разблокируйте преимущества трейдинга институционального уровня совершенно бесплатно',
      steps: [
        {
          title: 'Зарегистрируйтесь в Exness',
          description: 'Нажмите на нашу кнопку ниже, чтобы создать бесплатную учетную запись Exness через нашу партнерскую ссылку. Это займет всего 2 минуты. Также завершите верификацию личности и места жительства.',
          features: [
            'Несколько типов розничных счетов, низкий минимальный депозит $10, гибкое высокое кредитное плечо, мгновенные выводы без комиссии и различные варианты оплаты.',
          ],
        },
        {
          title: 'Пополните Счет',
          description: 'Внесите первоначальный депозит для активации счета. Выберите любую сумму, соответствующую вашим целям торгового капитала.',
        },
        {
          title: 'Отправьте ID Счета',
          description: 'После регистрации отправьте нам ваш ID счета Exness, чтобы мы могли проверить вашу регистрацию и активировать ваши преимущества.',
        },
        {
          title: 'Разблокируйте Все Бесплатно',
          description: 'Мгновенно получите доступ к премиальным сигна��ам, индивидуальному наставничеству и полному обучению стратегии DRIVE.',
        },
      ],
    },
    testimonials: {
      title: 'Что Говорят Ученики?',
      subtitle: 'Отзывы нашего сообщества преданных учеников',
      items: [
        {
          name: 'Джеймс М.',
          role: 'Найроби, Кения',
          content: 'Структурированные уроки помогли мне более четко понять торговые концепции. Сессии наставничества объяснили причины различных рыночных сетапов.',
        },
        {
          name: 'Лерато П.',
          role: 'Йоханнесбург, ЮАР',
          content: 'Быть частью сообщества Traders in the Zone поддерживает мою мотивацию. Обсуждения способствуют сотрудничеству и совместному обучению.',
        },
        {
          name: 'Эмека О.',
          role: 'Лагос, Нигерия',
          content: 'Я ценю баланс между руководством и образованием. Это помогает мне укрепить уверенность в разработке собственного подхода к тре��дингу.',
        },
      ],
      disclaimer: 'Эти отзывы отражают индивидуальный опыт обучения. Результаты торговли различаются, и прошлая производительность не гарантирует будущий успех.',
    },
    transformCTA: {
      title: 'Готовы Трансформировать Ваш Трейдинг?',
      subtitle: 'Присоединяйтесь к сотням трейдеров, строящих реальные навыки через систематическое образование и принципы надлежащего управления рисками.',
      stats: [
        { value: '500+', label: 'Обученных Студентов' },
        { value: '200+', label: 'Проведенных Уроков' },
        { value: '24/7', label: 'Образовательная Поддержка' },
      ],
      button: { text: 'Начать Обучение', href: '/services/learn' },
    },
    finalCTA: {
      title: 'Готовы Изучить Профессиональный Трейдинг?',
      subtitle: 'Начните систематическое торговое образование с проверенными ��етодами и реалистичными ожиданиями.',
      button: { text: 'Начать Обучение', href: '/services/learn' },
      benefits: [
        'Подход образование-прежде-всего',
        'Структурированный путь обучения',
        'Полн��я методология DRIVE',
        'Фокус на управлении рисками',
        'Постоянная поддержка наставника',
      ],
    },
    blogPreview: {
      title: 'Блог Торгового Образования',
      subtitle: 'Изучайте институциональные торговые концепции через наш структурированный образовательный контент',
    },
    newsletter: {
      title: 'Еженедельные Рыночные Заметки',
      subtitle: 'Сетапы, ошибки из которых мы учимся, и чек-листы доставляются в ваш почтовый ящик каждое воскресенье',
    },
    pages: {
      driveStrategy: {
        title: 'Стратегия DRIVE',
        subtitle: 'Наш систематический подход к анализу рынка форекс и п��инятию торговых решений',
        content: 'Изучите нашу полную методологию DRIVE для последовательного анализа рынка.'
      }
    },
  }
};

// Helper function to merge base content with translations
export function getLocalizedContent(baseContent: SiteContent, language: string): SiteContent {
  const translations = siteTranslations[language as keyof typeof siteTranslations] || {};
  
  // Deep merge function
  function deepMerge(target: any, source: any): any {
    if (!source) return target;

    const output = { ...target };

    for (const key in source) {
      const sourceVal = source[key];
      const targetVal = target ? target[key] : undefined;

      // If both are arrays, merge them by href (preserve untranslated base items)
      if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
        const seen = new Set<string>();
        const merged: any[] = [];
        // Add source items first (translated order), mark hrefs
        for (const item of sourceVal) {
          merged.push(item);
          if (item && typeof item === 'object' && item.href) seen.add(item.href);
        }
        // Append any target items not present in source
        for (const item of targetVal) {
          if (item && typeof item === 'object' && item.href && !seen.has(item.href)) {
            merged.push(item);
          }
        }
        output[key] = merged;
      } else if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal)) {
        output[key] = deepMerge(targetVal || {}, sourceVal);
      } else {
        output[key] = sourceVal;
      }
    }

    return output;
  }

  return deepMerge(baseContent, translations);
}
