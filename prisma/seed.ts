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
      { name: 'Programming Languages', slug: 'programming-languages', description: 'Language design and implementation',
        topics: ['Python', 'JavaScript', 'Rust', 'Go', 'C++', 'Java', 'TypeScript', 'Swift', 'Kotlin', 'Ruby', 'Haskell', 'Elixir'] },
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

async function main() {
  console.log('🌱 Seeding database...');

  const { hash } = await import('bcryptjs');
  const adminHash = await hash('admin1234', 12);

  // Admin user only — no demo/fake users
  await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@marketplace.com',
      name: 'Admin',
      role: 'admin',
      reputation: 9999,
      passwordHash: adminHash,
    },
  });
  console.log('✓ Admin: admin@marketplace.com / admin1234');

  // Create domains with subdomains and topics
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

  console.log('\n✅ Seed complete!');
  console.log(`   Domains: ${DOMAINS.length}`);
  console.log('   No fake users or consultations — clean production seed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
