import { Link } from 'react-router-dom';
import { Users, Trophy, Sparkles, ArrowRight } from 'lucide-react';

export default function About() {
  const stats = [
    { value: '500+', label: 'Events Hosted' },
    { value: '10K+', label: 'Participants' },
    { value: '50+', label: 'Institutions' },
    { value: '100+', label: 'Speakers' },
  ];

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of community-driven learning and networking. Every event is designed to foster meaningful connections.'
    },
    {
      icon: Trophy,
      title: 'Excellence',
      description: 'We curate only the highest quality events featuring industry experts, thought leaders, and hands-on learning experiences.'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'We embrace emerging technologies and forward-thinking topics that prepare participants for the future of work.'
    }
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/10" />
        <div className="absolute inset-0 hero-radial-1" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-dark-300 mb-8 animate-slide-up">
            <span>About GatherX</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
            Where Great Events <span className="gradient-text">Begin</span>
          </h1>
          
          <p className="text-lg md:text-xl text-dark-400 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            GatherX is a premium event management platform designed to connect people through transformative experiences.
            {' '}
            <span className="text-dark-300">Discover. Connect. Experience.</span>
            {' '}
            We make discovering, organizing, and attending events seamless and memorable.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="glass-card p-6 md:p-8 text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-dark-400 text-lg max-w-3xl mx-auto">
              To democratize access to world-class events and create a global community of learners, innovators, and leaders who shape the future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="glass-card p-8 text-center hover:border-primary-500/20 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-dark-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why GatherX</h2>
            <p className="text-dark-400 text-lg max-w-3xl mx-auto">
              We are reimagining how people discover and experience events. Here is what sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Curated Excellence',
                description: 'Every event on GatherX is carefully vetted to ensure quality content, reputable speakers, and valuable networking opportunities.'
              },
              {
                title: 'Seamless Experience',
                description: 'From discovery to registration to attendance, we provide a frictionless experience that lets you focus on what matters most - learning and connecting.'
              },
              {
                title: 'Diverse Opportunities',
                description: 'Whether you are into technology, arts, business, or sports, GatherX offers events across every domain and interest level.'
              },
              {
                title: 'Community Impact',
                description: 'We measure success by the connections made, skills gained, and careers transformed through our events.'
              }
            ].map((item, index) => (
              <div 
                key={item.title}
                className="glass-card p-8 hover:border-primary-500/20 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-dark-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Something <span className="gradient-text">Extraordinary</span>?
          </h2>
          <p className="text-lg text-dark-400 mb-10 max-w-2xl mx-auto">
            Join thousands of participants who have transformed their careers and expanded their horizons through GatherX events.
          </p>
          <Link to="/events" className="btn-primary text-base px-10 py-4">
            Explore Events
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
