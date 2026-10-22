import { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Download, Mail, ExternalLink, Github, Linkedin, Send, ChevronUp } from 'lucide-react';

// Ripple Effect Component
const RippleEffect = ({ x, y, size }) => {
  return (
    <span
      className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
    />
  );
};

// Interactive Card with Ripple
const InteractiveCard = ({ children, className = '', onClick }) => {
  const [ripples, setRipples] = useState([]);
  const cardRef = useRef(null);

  const createRipple = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onClick={createRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} size={ripple.size} />
      ))}
    </div>
  );
};

// Particle Background Component
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fill();
      }
    }

    for (let i = 0; i < 50; i++) {
      particles.current.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      particles.current.forEach((p1, i) => {
        particles.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={counterRef} className="text-4xl font-bold">
      {count}{suffix}
    </span>
  );
};

// Scroll to Top Button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

// Typing Animation Component
const TypingAnimation = ({ texts, typingSpeed = 100, deletingSpeed = 50, delayBetween = 2000 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), delayBetween);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, texts, typingSpeed, deletingSpeed, delayBetween]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="inline-block w-0.5 h-6 bg-blue-600 dark:bg-blue-400 ml-1 animate-pulse">|</span>
    </span>
  );
};

function App() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isVisible, setIsVisible] = useState({
  home: true,
  about: true,
  skills: true,
  projects: true,
  accomplishments: true,
  resume: true,
  contact: true,
});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.05 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '56aa3ae1-cf56-4226-b4e4-170aba77e76e',
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Portfolio Contact from ${formData.name}`,
        }),
      });

      if (response.ok) {
        alert('Message sent successfully! I will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      alert('Failed to send message. Please email me directly at yamini.shankari.aj@gmail.com');
    }
  };

  const skills = {
    'Programming Languages': ['Python', 'C++', 'C', 'Java', 'JavaScript', 'TypeScript'],
    'Web Development': ['HTML', 'CSS', 'Tailwind CSS', 'React.js'],
    'Backend and APIs': ['Node.js', 'FastAPI', 'Flask', 'RESTful APIs'],
    'Databases': ['PostgreSQL', 'MySQL', 'Supabase'],
    'Machine Learning & AI': ['TensorFlow', 'Keras', 'Scikit-learn', 'OpenCV', 'XGBoost', 'Pandas', 'NumPy', 'YOLO', 'ResNet', 'SVM'],
    'Version Control': ['Git', 'GitHub', 'Jira'],
  };

  const projects = [
    {
      title: 'Sign Language Interpreter',
      duration: '07/24 - 11/24',
      description: 'Real-time sign language recognition system using deep learning',
      details: [
        'Created a real-time sign language recognition system using a 3-layer CNN (TensorFlow, Keras), achieving 85% accuracy across four gestures.',
        'Built and annotated a custom dataset of 280 images and applied OpenCV preprocessing to enhance model performance.',
        'Trained and validated the 3-layer CNN using an 80/20 data split, enabling real-time classification of 4 sign language gestures with live webcam inference.',
      ],
      github: 'https://github.com/YaminiShankari/Sign-language-interpreter',
      stats: { accuracy: '85', gestures: 4, models: 3 }
    },
    {
      title: "Rubik's Cube Solver",
      duration: '04/25 - 07/25',
      description: 'Automated Rubik\'s Cube color recognition and solution generation',
      details: [
        'Implemented an ML-powered Rubik’s Cube solver using an SVM with RBF kernel to classify cube colors from real-time webcam input across all 6 faces.',
        'Employed OpenCV-based image preprocessing and ROI-based color detection, achieving 96.09% test accuracy for cube-color classification across 6 color classes.',
        'Integrated Kociemba’s two-phase solving algorithm with a Flask REST API and React+Vite interface to generate and visualize step-by-step cube solutions.',
      ],
      github: 'https://github.com/YaminiShankari/Rubik-s-cube-solver',
      stats: { accuracy: '96.09', colors: 6, algorithm: 2 }
    },
    {
      title: 'Smart Traffic Surveillance System',
      duration: '05/26 - 07/26',
      description: 'AI-powered Smart Traffic Surveillance System for real-time vehicle detection and traffic management',
      details: [
        'Constructed an AI-powered ANPR system using YOLOv8 and EasyOCR, achieving 92% plate detection and 87% OCR accuracy.',
        'Engineered a Flask Supabase PostgreSQL verification pipeline that cross-references recognized plates against 9 vehicle attributes and performs stolen, suspicious-plate, and violation checks.',
        'Automated the enforcement workflow from plate recognition to database verification and PDF challan generation, processing each image in an average of 240 ms through the end-to-end pipeline.'
      ],
      github: 'https://github.com/YaminiShankari/Smart-Traffic-Surveillance-System',
      stats: {accuracy: '92', models: 3},
      isOngoing: true,
      images: [
        { src: 'public/images/project3/home_page.jpg', alt: 'Smart Traffic Surveillance System - Home' },
        { src: 'public/images/project3/main_page.png', alt: 'Smart Traffic Surveillance System - Result' },
      ]
    },
  ];

  const achievements = [
    {
      title: 'Competitive Programming',
      description: 'Actively practiced Data Structures and Algorithms through competitive programming, enhancing problem-solving speed and logical reasoning',
      count: 500,
      suffix: '+ Problems'
    },
    {
      title: 'Content Creator - German Language',
      description: 'Created engaging German language content and supported event organization, enhancing interest in foreign languages amongst students',
      count: 100,
      suffix: '+ Followers'
    },
    {
      title: 'Academic Excellence and Leadership',
      description: 'Achieved school topper position in Computer Science and served as Games captain of Violet house',
      count: 90,
      suffix: '%'
    }
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
        <ParticleBackground />
        <ScrollToTop />

        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg z-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-pulse">
                  YS
                </h1>
              </div>
              
              <div className="hidden md:flex space-x-8">
                {['home', 'about', 'skills', 'projects', 'accomplishments', 'resume', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`capitalize transition-all duration-300 ${
                      activeSection === item
                        ? 'text-blue-600 dark:text-blue-400 font-semibold scale-110'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
                </button>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t dark:border-gray-700 animate-fade-in">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {['home', 'about', 'skills', 'projects', 'accomplishments', 'resume', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="block w-full text-left px-3 py-2 capitalize text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Home Section */}
        <section id="home" className={`pt-24 pb-20 px-4 relative z-10 transition-all duration-1000 ${isVisible.home ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                  Hi, I'm <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Yamini Shankari AJ</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                  <TypingAnimation 
                    texts={[
                      'Computer Science Student',
                      'AI/ML Enthusiast',
                      'Full Stack Developer',
                      'Problem Solver'
                    ]}
                  />
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-400 mb-8 max-w-2xl">
                  Passionate about leveraging technology to solve real-world problems through machine learning, 
                  deep learning, and innovative web solutions. Currently pursuing B.Tech at SRM Institute of 
                  Science and Technology, with expertise in AI, competitive programming, and full-stack development.
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  {[
                    { href: 'https://github.com/YaminiShankari', Icon: Github, color: 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600' },
                    { href: 'https://www.linkedin.com/in/yamini-shankari-aj-8135842a4/', Icon: Linkedin, color: 'bg-blue-600 hover:bg-blue-700' },
                    { href: 'mailto:yamini.shankari.aj@gmail.com', Icon: Mail, color: 'bg-red-600 hover:bg-red-700' }
                  ].map(({ href, Icon, color }, idx) => (
                    <InteractiveCard key={idx}>
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={`p-3 ${color} text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 inline-block`}
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    </InteractiveCard>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                  <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src="/images/photo1.jpg" 
                      alt="Yamini Shankari AJ" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={`py-20 px-4 relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-1000 ${isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">About Me</h2>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <InteractiveCard className="transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Education</h3>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bachelor of Technology</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-1">SRM Institute of Science and Technology, Ramapuram</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">August 2023 - May 2027</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">CGPA: 9.17/10</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Specializing in Computer Science with focus on Artificial Intelligence, Machine Learning, 
                      and Software Development. Active in competitive programming and technical content creation.
                    </p>
                  </div>
                </InteractiveCard>

                <InteractiveCard className="transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Languages</h3>
                    <div className="space-y-3">
                      {[
                        { lang: 'English', level: 'Proficient', percent: 95 },
                        { lang: 'German', level: 'Novice', percent: 20 },
                        { lang: 'Hindi', level: 'Beginner', percent: 40 },
                        { lang: 'Tamil', level: 'Native', percent: 100 }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/50 dark:bg-gray-600/50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{item.lang}</span>
                            <span className="text-gray-600 dark:text-gray-400">{item.level}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${item.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </InteractiveCard>
              </div>

              <InteractiveCard className="transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg h-full">
                  <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Professional Profile</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    I'm a dedicated computer science student with a passion for artificial intelligence and 
                    software development. My journey in tech has been driven by curiosity and a desire to 
                    create meaningful solutions that make a difference.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    With hands-on experience in machine learning, deep learning, and full-stack development, 
                    I've worked on projects ranging from automated Rubik's Cube solvers to Smart Traffic Surveillance 
                    Systems, combining computer vision and AI to solve complex problems.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Beyond coding, I'm an active competitive programmer, German language content creator 
                    and former Games Captain, bringing leadership and creativity to everything I do.
                  </p>
                </div>
              </InteractiveCard>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className={`py-20 px-4 relative z-10 transition-all duration-1000 ${isVisible.skills ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">Skills & Expertise</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(skills).map(([category, skillList]) => (
                <InteractiveCard 
                  key={category} 
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill) => (
                      <InteractiveCard key={skill}>
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium cursor-pointer inline-block hover:shadow-md transition-all duration-300">
                          {skill}
                        </span>
                      </InteractiveCard>
                    ))}
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className={`py-20 px-4 relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-1000 ${isVisible.projects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">Projects</h2>
            <div className="space-y-12">
              {projects.map((project, index) => (
  <InteractiveCard 
    key={index} 
    className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
  >
    {index === 0 && (
      <div className="relative w-full h-64 overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-1/2 h-full overflow-hidden">
            <img src="/project1/ASL-Home.png" alt="Sign Language Interpreter - Photo 1" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="w-1/2 h-full overflow-hidden">
            <img src="/project1/ASL-Main.png" alt="Sign Language Interpreter - Photo 2" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    )}
    {index === 1 && (
      <div className="relative w-full h-64 overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-1/3 h-full overflow-hidden">
            <img src="/project2/Rub-Home.png" alt="Rubik's Cube Solver - Photo 1" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="w-1/3 h-full overflow-hidden">
            <img src="/project2/Rub-Process.png" alt="Rubik's Cube Solver - Photo 2" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="w-1/3 h-full overflow-hidden">
            <img src="/project2/Rub-Soln.png" alt="Rubik's Cube Solver - Photo 3" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    )}
    {index === 2 && (
      <div className="relative w-full h-64 overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-1/2 h-full overflow-hidden">
            <img src="/project3/home_page.jpg" alt="Smart Traffic Surveillance System - Home" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="w-1/2 h-full overflow-hidden">
            <img src="/project3/main_page.png" alt="Smart Traffic Surveillance System - Result" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    )}
    <div className="p-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">{project.duration}</span>
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 dark:bg-gray-700 text-white rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-all">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">{project.description}</p>
      <ul className="space-y-2 mb-6">
        {project.details.map((detail, idx) => (
          <li key={idx} className="text-gray-600 dark:text-gray-400 flex items-start">
            <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-6 flex-wrap">
        {Object.entries(project.stats).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}{key === 'accuracy' ? '%' : ''}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}</div>
          </div>
        ))}
      </div>
    </div>
  </InteractiveCard>
))}
            </div>
          </div>
        </section>

        {/* Accomplishments Section */}
        <section id="accomplishments" className={`py-20 px-4 relative z-10 transition-all duration-1000 ${isVisible.accomplishments ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">Accomplishments</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {achievements.map((achievement, index) => (
                <InteractiveCard 
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                >
                  <div className="text-center mb-4">
                    <div className="text-blue-600 dark:text-blue-400 mb-2">
                      <AnimatedCounter end={achievement.count} suffix={achievement.suffix} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{achievement.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section id="resume" className={`py-20 px-4 relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-1000 ${isVisible.resume ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Resume</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Download my resume to learn more about my experience, skills, and projects.
            </p>
            <InteractiveCard>
              <a
                href="/Yamini_Shankari_AJ_Resume.pdf"
                download="Yamini_Shankari_AJ_Resume.pdf"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Download Resume
              </a>
            </InteractiveCard>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`py-20 px-4 relative z-10 transition-all duration-1000 ${isVisible.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-6">Let's Connect</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <a href="mailto:yamini.shankari.aj@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      yamini.shankari.aj@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <a href="https://github.com/YaminiShankari" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      github.com/YaminiShankari
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <a href="https://www.linkedin.com/in/yamini-shankari-aj-8135842a4/" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>

              <InteractiveCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </InteractiveCard>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Yamini Shankari AJ. Built with React & Tailwind CSS.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;