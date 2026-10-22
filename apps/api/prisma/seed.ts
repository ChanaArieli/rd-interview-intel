import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional, for clean seed)
  await prisma.interviewQuestion.deleteMany();
  await prisma.interviewReport.deleteMany();
  await prisma.companyUnlock.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create 12 Israeli tech companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Wiz',
        slug: 'wiz',
        industry: 'Cybersecurity'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Monday.com',
        slug: 'monday-com',
        industry: 'Work OS'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Wix',
        slug: 'wix',
        industry: 'Website Builder'
      }
    }),
    prisma.company.create({
      data: {
        name: 'AppsFlyer',
        slug: 'appsflyer',
        industry: 'Mobile Attribution'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Gong',
        slug: 'gong',
        industry: 'Revenue Intelligence'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Cato Networks',
        slug: 'cato-networks',
        industry: 'Zero Trust Network'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Nvidia',
        slug: 'nvidia',
        industry: 'AI/GPU Computing'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Papaya Global',
        slug: 'papaya-global',
        industry: 'HR Finance'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Fireblocks',
        slug: 'fireblocks',
        industry: 'Digital Asset Infrastructure'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Lightricks',
        slug: 'lightricks',
        industry: 'Mobile Imaging'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Melio',
        slug: 'melio',
        industry: 'B2B Payments'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Snyk',
        slug: 'snyk',
        industry: 'Developer Security'
      }
    })
  ]);

  console.log(`✅ Created ${companies.length} companies`);

  const wiz = companies[0];
  const mondaycom = companies[1];
  const wix = companies[2];

  // Create 4 realistic interview reports with Hebrew descriptions
  const reports = [
    // Wiz Report 1 (Backend)
    await prisma.interviewReport.create({
      data: {
        companyId: wiz.id,
        roleCategory: 'Backend',
        seniority: 'Mid',
        interviewPeriod: 'Q4 2026',
        overallProcess: 'תהליך ראיון רחב המכיל 4 שלבים: טלפוני עם הרקרוטר, טכני עם Senior Engineer, System Design, ודיון עם המנהל. תהליך ממוקד על Distributed Systems, Cloud Architecture, ו-Go/Python.',
        difficulty: 4,
        questions: {
          create: [
            {
              stageType: 'Live Coding',
              questionText: 'Design a concurrent task queue system that processes jobs with retries and exponential backoff. Handle edge cases like duplicate submissions.',
              followUps: 'How would you handle failed jobs? What about job ordering guarantees?',
              tips: 'Think about goroutines vs. worker pools in Go. Consider persistence for reliability.',
              tags: ['Concurrency', 'Golang', 'Distributed Systems', 'Queue Patterns']
            },
            {
              stageType: 'System Design',
              questionText: 'Design a cloud-native security scanning service that can process millions of API requests daily with sub-100ms latency.',
              followUps: 'How would you handle cache invalidation? What about rate limiting?',
              tips: 'Consider multi-region deployment, caching strategies (Redis), and async processing.',
              tags: ['System Design', 'Microservices', 'Cloud Architecture', 'Performance']
            }
          ]
        }
      }
    }),

    // Wiz Report 2 (Fullstack)
    await prisma.interviewReport.create({
      data: {
        companyId: wiz.id,
        roleCategory: 'Fullstack',
        seniority: 'Senior',
        interviewPeriod: 'Q3 2026',
        overallProcess: 'שלושה שלבים: Technical screening, Take-Home assignment (24-48 שעות), ופגישה עם הצוות. ההדגש על Full-Stack architecture, Infrastructure-as-Code, וטיפול בלוגים/monitoring.',
        difficulty: 5,
        questions: {
          create: [
            {
              stageType: 'Take-Home',
              questionText: 'Build a microservices-based API gateway with rate limiting, request logging, and metrics collection using Docker and Kubernetes-ready design.',
              followUps: 'Include unit tests and performance benchmarks.',
              tips: 'Use Node.js Express or Go. Focus on clean error handling and observability.',
              tags: ['Microservices', 'API Gateway', 'Docker', 'Observability']
            },
            {
              stageType: 'Technical Deep Dive',
              questionText: 'Walk us through your approach to debugging a production issue where latency increased 10x overnight.',
              followUps: 'What tools would you use? How would you correlate logs and metrics?',
              tips: 'Mention ELK stack, Prometheus, tracing (Jaeger), and your investigation methodology.',
              tags: ['Debugging', 'Production Support', 'Observability', 'Troubleshooting']
            }
          ]
        }
      }
    }),

    // Monday.com Report
    await prisma.interviewReport.create({
      data: {
        companyId: mondaycom.id,
        roleCategory: 'Frontend',
        seniority: 'Mid',
        interviewPeriod: 'Q4 2026',
        overallProcess: 'דו-שלבי: טלפוני עם מהנדס ו-React specific technical. ואז פגישה עם Product Manager ו-Engineering Manager על architecture ו-teamwork.',
        difficulty: 3,
        questions: {
          create: [
            {
              stageType: 'Live Coding',
              questionText: 'Implement a performant infinite scrolling list component with virtual scrolling (windowing) using React. Handle dynamic item heights.',
              followUps: 'How would you handle filtering and sorting without re-fetching?',
              tips: 'Look at libraries like react-window or react-virtualized. Focus on memoization and useCallback.',
              tags: ['React', 'Performance', 'Component Design', 'Advanced Patterns']
            },
            {
              stageType: 'Architecture',
              questionText: 'Design the state management and component structure for a complex dashboard with multiple synchronized widgets and real-time updates.',
              followUps: 'Would you use Context API, Redux, or Zustand? Why?',
              tips: 'Discuss trade-offs between simplicity and scalability. Mention testing strategy.',
              tags: ['React Architecture', 'State Management', 'Real-time UI']
            }
          ]
        }
      }
    }),

    // Wix Report
    await prisma.interviewReport.create({
      data: {
        companyId: wix.id,
        roleCategory: 'Backend',
        seniority: 'Junior',
        interviewPeriod: 'Q2 2026',
        overallProcess: 'שלוש שיחות: התראה של הנושא, שיחה קוד עם בדיקות כתובות, ודיון עם מנהל הצוות על technical growth path.',
        difficulty: 2,
        questions: {
          create: [
            {
              stageType: 'Live Coding',
              questionText: 'Implement a function to flatten a nested JSON structure into key-value pairs with dot notation (e.g., {a: {b: 1}} => {\"a.b\": 1}).',
              followUps: 'Handle arrays. What about circular references?',
              tips: 'Use recursion with a path accumulator. This is about code clarity.',
              tags: ['JavaScript', 'Recursion', 'Data Structures']
            }
          ]
        }
      }
    })
  ];

  console.log(`✅ Created ${reports.length} interview reports with questions`);

  // Create sample user
  const user = await prisma.user.create({
    data: {
      email: 'sample@example.com',
      name: 'Sample User',
      googleId: 'sample-google-id-123',
      roleCategory: 'Backend',
      seniority: 'Mid',
      credits: 5,
      hasCompletedOnboarding: true
    }
  });

  console.log(`✅ Created sample user: ${user.email}`);

  // Create a sample company unlock
  await prisma.companyUnlock.create({
    data: {
      userId: user.id,
      companyId: wiz.id
    }
  });

  console.log(`✅ Created sample company unlock (Wiz)`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
