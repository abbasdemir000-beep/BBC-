import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 200+ domain hierarchy
const DOMAINS = [
  { name: 'Medicine & Health', slug: 'medicine', icon: '🏥', color: '#ef4444', description: 'Medical diagnosis, treatment, and health sciences',
    subDomains: [
      { name: 'Internal Medicine', slug: 'internal-medicine', description: 'Diagnosis and treatment of adult diseases',
        topics: ['Cardiology', 'Nephrology', 'Gastroenterology', 'Endocrinology', 'Pulmonology'] },
      { name: 'Surgery', slug: 'surgery', description: 'Surgical procedures and interventions',
        topics: ['General Surgery', 'Orthopedic Surgery', 'Neurosurgery', 'Cardiac Surgery'] },
      { name: 'Pediatrics', slug: 'pediatrics', description: 'Children healthcare',
        topics: ['Neonatal Care', 'Pediatric Cardiology', 'Child Development'] },
      { name: 'Psychiatry', slug: 'psychiatry', description: 'Mental health disorders and treatment',
        topics: ['Depression', 'Anxiety Disorders', 'Schizophrenia', 'Addiction'] },
      { name: 'Pharmacology', slug: 'pharmacology', description: 'Drug mechanisms and therapeutics',
        topics: ['Drug Interactions', 'Clinical Pharmacology', 'Toxicology'] },
    ]
  },
  { name: 'Engineering', slug: 'engineering', icon: '⚙️', color: '#f59e0b', description: 'Applied engineering and technical problem solving',
    subDomains: [
      { name: 'Civil Engineering', slug: 'civil-engineering', description: 'Infrastructure and structural design',
        topics: ['Structural Analysis', 'Geotechnical Engineering', 'Transportation'] },
      { name: 'Mechanical Engineering', slug: 'mechanical-engineering', description: 'Machines and mechanical systems',
        topics: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing', 'Robotics'] },
      { name: 'Electrical Engineering', slug: 'electrical-engineering', description: 'Electrical systems and circuits',
        topics: ['Circuit Design', 'Power Systems', 'Signal Processing', 'Control Systems'] },
      { name: 'Chemical Engineering', slug: 'chemical-engineering', description: 'Chemical processes and design',
        topics: ['Reaction Engineering', 'Process Control', 'Separation Processes'] },
      { name: 'Aerospace Engineering', slug: 'aerospace-engineering', description: 'Aircraft and spacecraft design',
        topics: ['Aerodynamics', 'Propulsion', 'Orbital Mechanics'] },
    ]
  },
  { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#8b5cf6', description: 'Pure and applied mathematics',
    subDomains: [
      { name: 'Calculus & Analysis', slug: 'calculus-analysis', description: 'Limits, derivatives, integrals',
        topics: ['Differential Calculus', 'Integral Calculus', 'Real Analysis', 'Complex Analysis'] },
      { name: 'Algebra', slug: 'algebra', description: 'Algebraic structures and equations',
        topics: ['Linear Algebra', 'Abstract Algebra', 'Number Theory', 'Group Theory'] },
      { name: 'Statistics & Probability', slug: 'statistics-probability', description: 'Data analysis and probability theory',
        topics: ['Bayesian Statistics', 'Hypothesis Testing', 'Regression Analysis'] },
      { name: 'Discrete Mathematics', slug: 'discrete-math', description: 'Graph theory, combinatorics',
        topics: ['Graph Theory', 'Combinatorics', 'Logic', 'Set Theory'] },
    ]
  },
  { name: 'Physics', slug: 'physics', icon: '⚛️', color: '#06b6d4', description: 'Fundamental physics and applications',
    subDomains: [
      { name: 'Classical Mechanics', slug: 'classical-mechanics', description: 'Newtonian and Lagrangian mechanics',
        topics: ["Newton's Laws", 'Kinematics', 'Energy and Work', 'Oscillations'] },
      { name: 'Quantum Physics', slug: 'quantum-physics', description: 'Quantum mechanics and quantum field theory',
        topics: ['Wave-Particle Duality', 'Schrödinger Equation', 'Quantum Entanglement'] },
      { name: 'Electromagnetism', slug: 'electromagnetism', description: 'Electric and magnetic fields',
        topics: ["Maxwell's Equations", 'Optics', 'Electromagnetic Waves'] },
      { name: 'Thermodynamics', slug: 'thermodynamics', description: 'Heat, energy, and entropy',
        topics: ['Laws of Thermodynamics', 'Statistical Mechanics', 'Phase Transitions'] },
    ]
  },
  { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: '#3b82f6', description: 'CS theory, algorithms, and systems',
    subDomains: [
      { name: 'Algorithms & Data Structures', slug: 'algorithms', description: 'Algorithm design and complexity',
        topics: ['Sorting Algorithms', 'Graph Algorithms', 'Dynamic Programming', 'Complexity Theory'] },
      { name: 'Machine Learning & AI', slug: 'machine-learning', description: 'ML models and AI systems',
        topics: ['Neural Networks', 'Reinforcement Learning', 'NLP', 'Computer Vision'] },
      { name: 'Systems Programming', slug: 'systems-programming', description: 'OS, compilers, and low-level systems',
        topics: ['Operating Systems', 'Compiler Design', 'Memory Management'] },
      { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security vulnerabilities and defenses',
        topics: ['Cryptography', 'Network Security', 'Penetration Testing', 'Malware Analysis'] },
      { name: 'Databases', slug: 'databases', description: 'Database design and query optimization',
        topics: ['SQL Optimization', 'NoSQL Design', 'Distributed Databases'] },
    ]
  },
  { name: 'Law', slug: 'law', icon: '⚖️', color: '#1d4ed8', description: 'Legal systems, rights, and regulations',
    subDomains: [
      { name: 'Contract Law', slug: 'contract-law', description: 'Contracts and commercial agreements',
        topics: ['Contract Formation', 'Breach of Contract', 'Commercial Agreements'] },
      { name: 'Criminal Law', slug: 'criminal-law', description: 'Criminal offenses and defenses',
        topics: ['Criminal Procedure', 'Evidence Law', 'Sentencing'] },
      { name: 'Intellectual Property', slug: 'intellectual-property', description: 'Patents, trademarks, copyrights',
        topics: ['Patent Law', 'Copyright Law', 'Trademark Law', 'Trade Secrets'] },
      { name: 'International Law', slug: 'international-law', description: 'Treaties and international regulations',
        topics: ['Human Rights Law', 'Trade Law', 'Arbitration'] },
    ]
  },
  { name: 'Business & Finance', slug: 'business', icon: '📊', color: '#059669', description: 'Business strategy, finance, and management',
    subDomains: [
      { name: 'Financial Analysis', slug: 'financial-analysis', description: 'Financial modeling and valuation',
        topics: ['DCF Valuation', 'Financial Ratios', 'Investment Analysis'] },
      { name: 'Marketing', slug: 'marketing', description: 'Marketing strategy and consumer behavior',
        topics: ['Digital Marketing', 'Brand Strategy', 'Market Research', 'SEO'] },
      { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Startup strategy and growth',
        topics: ['Business Model Design', 'Fundraising', 'Product-Market Fit'] },
      { name: 'Accounting', slug: 'accounting', description: 'Financial accounting and auditing',
        topics: ['GAAP/IFRS', 'Tax Accounting', 'Auditing'] },
    ]
  },
  { name: 'Chemistry', slug: 'chemistry', icon: '🧪', color: '#7c3aed', description: 'Chemical properties and reactions',
    subDomains: [
      { name: 'Organic Chemistry', slug: 'organic-chemistry', description: 'Carbon-based compounds',
        topics: ['Reaction Mechanisms', 'Synthesis', 'Spectroscopy', 'Stereochemistry'] },
      { name: 'Inorganic Chemistry', slug: 'inorganic-chemistry', description: 'Inorganic compounds and metals',
        topics: ['Coordination Chemistry', 'Crystal Field Theory', 'Catalysis'] },
      { name: 'Physical Chemistry', slug: 'physical-chemistry', description: 'Thermodynamics and quantum chemistry',
        topics: ['Chemical Kinetics', 'Electrochemistry', 'Quantum Chemistry'] },
    ]
  },
  { name: 'Biology', slug: 'biology', icon: '🧬', color: '#16a34a', description: 'Life sciences and biological systems',
    subDomains: [
      { name: 'Molecular Biology', slug: 'molecular-biology', description: 'DNA, RNA, and proteins',
        topics: ['Gene Expression', 'CRISPR', 'Proteomics', 'Genomics'] },
      { name: 'Ecology', slug: 'ecology', description: 'Ecosystems and environmental biology',
        topics: ['Population Dynamics', 'Biodiversity', 'Climate Change Biology'] },
      { name: 'Microbiology', slug: 'microbiology', description: 'Bacteria, viruses, and microorganisms',
        topics: ['Bacteriology', 'Virology', 'Immunology', 'Antibiotic Resistance'] },
    ]
  },
  { name: 'Education & Pedagogy', slug: 'education', icon: '🎓', color: '#d97706', description: 'Teaching methods and learning sciences',
    subDomains: [
      { name: 'Curriculum Design', slug: 'curriculum-design', description: 'Educational curriculum development',
        topics: ['Learning Objectives', 'Assessment Design', 'STEM Curriculum'] },
      { name: 'Educational Psychology', slug: 'educational-psychology', description: 'Learning and cognitive development',
        topics: ['Cognitive Load Theory', 'Motivation', 'Special Education'] },
    ]
  },
  { name: 'Psychology', slug: 'psychology', icon: '🧠', color: '#ec4899', description: 'Human behavior and mental processes',
    subDomains: [
      { name: 'Clinical Psychology', slug: 'clinical-psychology', description: 'Mental health diagnosis and therapy',
        topics: ['CBT', 'Trauma Therapy', 'Neuropsychology'] },
      { name: 'Social Psychology', slug: 'social-psychology', description: 'Social influence and group behavior',
        topics: ['Conformity', 'Prejudice', 'Social Identity Theory'] },
      { name: 'Cognitive Psychology', slug: 'cognitive-psychology', description: 'Memory, attention, and perception',
        topics: ['Working Memory', 'Decision Making', 'Language Acquisition'] },
    ]
  },
  { name: 'Architecture & Design', slug: 'architecture', icon: '🏗️', color: '#9333ea', description: 'Building design and spatial planning',
    subDomains: [
      { name: 'Structural Design', slug: 'structural-design', description: 'Building structure and safety',
        topics: ['Load Analysis', 'Foundation Design', 'Seismic Design'] },
      { name: 'Urban Planning', slug: 'urban-planning', description: 'City and regional planning',
        topics: ['Zoning', 'Transportation Planning', 'Smart Cities'] },
    ]
  },
  { name: 'Economics', slug: 'economics', icon: '📈', color: '#0891b2', description: 'Microeconomics, macroeconomics, and policy',
    subDomains: [
      { name: 'Microeconomics', slug: 'microeconomics', description: 'Individual markets and consumer behavior',
        topics: ['Supply and Demand', 'Game Theory', 'Market Failures'] },
      { name: 'Macroeconomics', slug: 'macroeconomics', description: 'National and global economies',
        topics: ['Monetary Policy', 'Fiscal Policy', 'International Trade'] },
    ]
  },
  { name: 'Nutrition & Dietetics', slug: 'nutrition', icon: '🥗', color: '#65a30d', description: 'Food science and dietary health',
    subDomains: [
      { name: 'Clinical Nutrition', slug: 'clinical-nutrition', description: 'Medical nutrition therapy',
        topics: ['Metabolic Disorders', 'Sports Nutrition', 'Pediatric Nutrition'] },
      { name: 'Food Science', slug: 'food-science', description: 'Food composition and safety',
        topics: ['Food Safety', 'Functional Foods', 'Food Biotechnology'] },
    ]
  },
  { name: 'Sports & Exercise Science', slug: 'sports', icon: '🏃', color: '#f97316', description: 'Athletic performance and exercise physiology',
    subDomains: [
      { name: 'Exercise Physiology', slug: 'exercise-physiology', description: 'Body response to exercise',
        topics: ['VO2 Max', 'Muscle Physiology', 'Recovery Science'] },
      { name: 'Sports Psychology', slug: 'sports-psychology', description: 'Mental performance in sports',
        topics: ['Mental Toughness', 'Motivation', 'Team Dynamics'] },
    ]
  },
  { name: 'Environmental Science', slug: 'environmental', icon: '🌍', color: '#15803d', description: 'Environment, climate, and sustainability',
    subDomains: [
      { name: 'Climate Science', slug: 'climate-science', description: 'Climate change and meteorology',
        topics: ['Greenhouse Effect', 'Climate Modeling', 'Renewable Energy'] },
      { name: 'Environmental Policy', slug: 'environmental-policy', description: 'Environmental law and governance',
        topics: ['Carbon Markets', 'ESG', 'Environmental Impact Assessment'] },
    ]
  },
  { name: 'Philosophy', slug: 'philosophy', icon: '🤔', color: '#6366f1', description: 'Logic, ethics, metaphysics, and epistemology',
    subDomains: [
      { name: 'Ethics', slug: 'ethics', description: 'Moral philosophy and applied ethics',
        topics: ['Utilitarianism', 'Deontology', 'AI Ethics', 'Bioethics'] },
      { name: 'Logic & Epistemology', slug: 'logic-epistemology', description: 'Reasoning and knowledge theory',
        topics: ['Formal Logic', 'Informal Fallacies', 'Theory of Knowledge'] },
    ]
  },
  { name: 'History', slug: 'history', icon: '📜', color: '#78350f', description: 'World history and historical analysis',
    subDomains: [
      { name: 'Modern History', slug: 'modern-history', description: '18th century to present',
        topics: ['World War I & II', 'Cold War', 'Decolonization'] },
      { name: 'Ancient History', slug: 'ancient-history', description: 'Prehistory to medieval period',
        topics: ['Ancient Civilizations', 'Roman Empire', 'Medieval Europe'] },
    ]
  },
  { name: 'Arts & Humanities', slug: 'arts', icon: '🎨', color: '#db2777', description: 'Fine arts, literature, and cultural studies',
    subDomains: [
      { name: 'Literature', slug: 'literature', description: 'Literary analysis and writing',
        topics: ['Literary Theory', 'Creative Writing', 'Poetry Analysis'] },
      { name: 'Visual Arts', slug: 'visual-arts', description: 'Painting, sculpture, and design',
        topics: ['Art History', 'Digital Art', 'Graphic Design'] },
    ]
  },
  { name: 'Linguistics', slug: 'linguistics', icon: '🗣️', color: '#7c3aed', description: 'Language structure and acquisition',
    subDomains: [
      { name: 'Computational Linguistics', slug: 'computational-linguistics', description: 'NLP and language models',
        topics: ['Syntax Parsing', 'Semantics', 'Language Models'] },
      { name: 'Applied Linguistics', slug: 'applied-linguistics', description: 'Language teaching and translation',
        topics: ['Second Language Acquisition', 'Translation Theory'] },
    ]
  },
];

const EXPERTS = [
  { name: 'Dr. Sarah Chen', email: 'sarah.chen@example.com', bio: 'Cardiologist with 15 years of clinical experience.', domain: 'medicine', yearsExperience: 15, hourlyRate: 150, rating: 4.9, totalReviews: 234 },
  { name: 'Prof. James Wright', email: 'james.wright@example.com', bio: 'Professor of Structural Engineering at MIT.', domain: 'engineering', yearsExperience: 20, hourlyRate: 120, rating: 4.8, totalReviews: 189 },
  { name: 'Dr. Maria Santos', email: 'maria.santos@example.com', bio: 'Applied mathematician specializing in numerical analysis.', domain: 'mathematics', yearsExperience: 12, hourlyRate: 100, rating: 4.7, totalReviews: 156 },
  { name: 'Dr. Amir Khalil', email: 'amir.khalil@example.com', bio: 'Quantum physicist, former CERN researcher.', domain: 'physics', yearsExperience: 18, hourlyRate: 130, rating: 4.9, totalReviews: 201 },
  { name: 'Alex Kim', email: 'alex.kim@example.com', bio: 'Senior ML Engineer at Google Brain.', domain: 'computer-science', yearsExperience: 10, hourlyRate: 180, rating: 4.8, totalReviews: 312 },
  { name: 'Jennifer Lee', email: 'jennifer.lee@example.com', bio: 'Corporate attorney with IP law specialization.', domain: 'law', yearsExperience: 14, hourlyRate: 200, rating: 4.7, totalReviews: 145 },
  { name: 'Michael Torres', email: 'michael.torres@example.com', bio: 'CFO of two successful startups, finance expert.', domain: 'business', yearsExperience: 16, hourlyRate: 160, rating: 4.6, totalReviews: 178 },
  { name: 'Dr. Priya Sharma', email: 'priya.sharma@example.com', bio: 'Organic chemistry researcher and professor.', domain: 'chemistry', yearsExperience: 11, hourlyRate: 110, rating: 4.8, totalReviews: 167 },
  { name: 'Dr. Robert Anderson', email: 'robert.anderson@example.com', bio: 'Molecular biologist specializing in gene editing.', domain: 'biology', yearsExperience: 13, hourlyRate: 125, rating: 4.7, totalReviews: 143 },
  { name: 'Dr. Emma Wilson', email: 'emma.wilson@example.com', bio: 'Educational psychologist and curriculum designer.', domain: 'education', yearsExperience: 9, hourlyRate: 90, rating: 4.6, totalReviews: 98 },
  { name: 'Dr. Carlos Mendez', email: 'carlos.mendez@example.com', bio: 'Clinical psychologist with CBT expertise.', domain: 'psychology', yearsExperience: 12, hourlyRate: 120, rating: 4.8, totalReviews: 187 },
  { name: 'Sophia Laurent', email: 'sophia.laurent@example.com', bio: 'Award-winning architect and urban planner.', domain: 'architecture', yearsExperience: 15, hourlyRate: 140, rating: 4.7, totalReviews: 134 },
  { name: 'Dr. John Park', email: 'john.park@example.com', bio: 'Macroeconomist, former IMF advisor.', domain: 'economics', yearsExperience: 20, hourlyRate: 175, rating: 4.9, totalReviews: 223 },
  { name: 'Lisa Thompson', email: 'lisa.thompson@example.com', bio: 'Registered dietitian and sports nutritionist.', domain: 'nutrition', yearsExperience: 8, hourlyRate: 85, rating: 4.6, totalReviews: 112 },
  { name: 'Coach David Brown', email: 'david.brown@example.com', bio: 'Exercise physiologist, Olympic training specialist.', domain: 'sports', yearsExperience: 17, hourlyRate: 110, rating: 4.8, totalReviews: 198 },
  { name: 'Dr. Anna Green', email: 'anna.green@example.com', bio: 'Climate scientist and environmental policy expert.', domain: 'environmental', yearsExperience: 14, hourlyRate: 130, rating: 4.7, totalReviews: 156 },
  { name: 'Prof. Thomas Müller', email: 'thomas.muller@example.com', bio: 'Professor of Ethics, specializing in AI ethics.', domain: 'philosophy', yearsExperience: 22, hourlyRate: 115, rating: 4.8, totalReviews: 189 },
  { name: 'Dr. Rachel Cohen', email: 'rachel.cohen@example.com', bio: 'Historian focusing on 20th century European history.', domain: 'history', yearsExperience: 16, hourlyRate: 95, rating: 4.7, totalReviews: 134 },
  { name: 'Isabella Rossi', email: 'isabella.rossi@example.com', bio: 'Art historian and contemporary art critic.', domain: 'arts', yearsExperience: 12, hourlyRate: 100, rating: 4.6, totalReviews: 123 },
  { name: 'Dr. Wei Zhang', email: 'wei.zhang@example.com', bio: 'Computational linguist, NLP researcher.', domain: 'linguistics', yearsExperience: 10, hourlyRate: 120, rating: 4.7, totalReviews: 145 },
];

const CONSULTATIONS = [
  { title: 'Interpreting ECG results for arrhythmia detection', description: 'I have a patient with irregular heartbeat. The ECG shows some unusual patterns. Can you help interpret the findings and suggest next steps for diagnosis?', domain: 'medicine', questionType: 'diagnosis', difficulty: 'advanced', urgency: 'high' },
  { title: 'Optimal concrete mix design for high-rise foundation', description: 'Working on a 50-story building in seismic zone. Need guidance on concrete mix design for the pile foundation considering both strength and durability requirements.', domain: 'engineering', questionType: 'problem_solving', difficulty: 'expert', urgency: 'normal' },
  { title: 'Proof of Riemann Hypothesis approaches', description: 'Looking for a comprehensive explanation of the current leading approaches to proving the Riemann Hypothesis. What is the state of research?', domain: 'mathematics', questionType: 'explanation', difficulty: 'expert', urgency: 'low' },
  { title: 'Quantum entanglement in quantum computing', description: 'How does quantum entanglement enable quantum speedup? Please explain the mechanism with concrete examples from Shor\'s algorithm.', domain: 'physics', questionType: 'explanation', difficulty: 'advanced', urgency: 'normal' },
  { title: 'Implementing transformer attention mechanism from scratch', description: 'I need to implement multi-head self-attention in PyTorch without using nn.MultiheadAttention. Can you walk through the math and implementation?', domain: 'computer-science', questionType: 'problem_solving', difficulty: 'advanced', urgency: 'normal' },
  { title: 'Non-compete clause enforceability in California', description: 'Our startup wants employees to sign non-compete agreements. We operate remotely with employees in California. What is the legal landscape and risks?', domain: 'law', questionType: 'advice', difficulty: 'intermediate', urgency: 'high' },
  { title: 'Series A valuation methodology for SaaS startup', description: 'We are preparing for Series A. ARR is $2M, growing 15% MoM. What valuation methodology should we use and what multiples are typical?', domain: 'business', questionType: 'advice', difficulty: 'advanced', urgency: 'high' },
  { title: 'Grignard reaction mechanism and selectivity', description: 'Explain the detailed mechanism of Grignard reactions including factors that affect chemoselectivity when multiple electrophilic sites are present.', domain: 'chemistry', questionType: 'explanation', difficulty: 'advanced', urgency: 'normal' },
  { title: 'CRISPR off-target effects and mitigation strategies', description: 'What are the known off-target effects of CRISPR-Cas9 and what are the current strategies to minimize them in therapeutic applications?', domain: 'biology', questionType: 'explanation', difficulty: 'expert', urgency: 'normal' },
  { title: 'Designing adaptive learning for neurodivergent students', description: 'I teach a class with several students with ADHD and dyslexia. What evidence-based pedagogical strategies can I use to make my curriculum more inclusive?', domain: 'education', questionType: 'advice', difficulty: 'intermediate', urgency: 'normal' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'demo@marketplace.com' },
    update: {},
    create: {
      email: 'demo@marketplace.com',
      name: 'Demo User',
      role: 'user',
      reputation: 150,
    },
  });
  console.log(`✓ User: ${user.name}`);

  // Create domains with subdomains and topics
  const domainMap: Record<string, string> = {};
  const subDomainMap: Record<string, string> = {};

  for (const d of DOMAINS) {
    const domain = await prisma.domain.upsert({
      where: { slug: d.slug },
      update: { expertCount: 0 },
      create: {
        name: d.name,
        slug: d.slug,
        description: d.description,
        icon: d.icon,
        color: d.color,
        expertCount: 0,
      },
    });
    domainMap[d.slug] = domain.id;
    console.log(`  ✓ Domain: ${d.name}`);

    for (const sd of d.subDomains) {
      const subDomain = await prisma.subDomain.upsert({
        where: { domainId_slug: { domainId: domain.id, slug: sd.slug } },
        update: {},
        create: {
          name: sd.name,
          slug: sd.slug,
          description: sd.description,
          domainId: domain.id,
        },
      });
      subDomainMap[sd.slug] = subDomain.id;

      for (const topicName of sd.topics) {
        const topicSlug = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.topic.upsert({
          where: { subDomainId_slug: { subDomainId: subDomain.id, slug: topicSlug } },
          update: {},
          create: {
            name: topicName,
            slug: topicSlug,
            description: `Advanced ${topicName} concepts and applications`,
            subDomainId: subDomain.id,
            difficulty: 'intermediate',
          },
        });
      }
    }
  }

  // Create experts
  const expertIds: string[] = [];
  for (const e of EXPERTS) {
    const domainId = domainMap[e.domain];
    const expert = await prisma.expert.upsert({
      where: { email: e.email },
      update: {},
      create: {
        name: e.name,
        email: e.email,
        bio: e.bio,
        yearsExperience: e.yearsExperience,
        hourlyRate: e.hourlyRate,
        rating: e.rating,
        totalReviews: e.totalReviews,
        isVerified: true,
        isAvailable: true,
        domainId: domainId || null,
        embeddingVector: JSON.stringify(Array.from({ length: 64 }, () => Math.random() * 2 - 1)),
      },
    });
    expertIds.push(expert.id);

    // Update domain expert count
    if (domainId) {
      await prisma.domain.update({
        where: { id: domainId },
        data: { expertCount: { increment: 1 } },
      });
    }
    console.log(`  ✓ Expert: ${e.name}`);
  }

  // Create consultations
  for (let i = 0; i < CONSULTATIONS.length; i++) {
    const c = CONSULTATIONS[i];
    const domainId = domainMap[c.domain];
    await prisma.consultation.create({
      data: {
        title: c.title,
        description: c.description,
        status: i < 3 ? 'active' : i < 6 ? 'completed' : 'pending',
        questionType: c.questionType,
        difficulty: c.difficulty,
        urgency: c.urgency,
        prizePoints: 100 + i * 25,
        userId: user.id,
        domainId: domainId || null,
      },
    });
    console.log(`  ✓ Consultation: ${c.title.slice(0, 50)}...`);
  }

  // Create sample rewards
  await prisma.reward.create({
    data: {
      userId: user.id,
      type: 'daily_bonus',
      points: 50,
      status: 'available',
      description: 'Daily login bonus',
    },
  });

  console.log('\n✅ Seed complete!');
  console.log(`   Domains: ${DOMAINS.length}`);
  console.log(`   Experts: ${EXPERTS.length}`);
  console.log(`   Consultations: ${CONSULTATIONS.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
