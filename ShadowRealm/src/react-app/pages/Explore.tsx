import { useAuth } from '@getmocha/users-service/react';
import { Navigate } from 'react-router';
import { ArrowLeft, Skull, Eye, Film, BookOpen } from 'lucide-react';
import { Link } from 'react-router';

export default function Explore() {
  const { user, isPending } = useAuth();

  if (!isPending && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin">
          <Skull className="w-12 h-12 text-blood-red" />
        </div>
      </div>
    );
  }

  const horrorFacts = [
    {
      title: "The Exorcist's Cursed Production",
      fact: "During the filming of The Exorcist (1973), the entire set caught fire and burned down, except for Regan's bedroom. The film was also plagued by deaths of nine cast and crew members, leading many to believe the production was genuinely cursed.",
      icon: "🔥"
    },
    {
      title: "Poltergeist's Real Skeletons",
      fact: "The skeletons used in the pool scene in Poltergeist (1982) were real human skeletons because they were cheaper than plastic ones. The cast didn't know this during filming, which might explain their genuinely terrified reactions.",
      icon: "💀"
    },
    {
      title: "The Shining's Hidden Messages",
      fact: "Stanley Kubrick filmed 127 takes of the 'Here's Johnny!' scene in The Shining. The hotel room number was changed from 217 (in the book) to 237 because the real hotel was afraid guests wouldn't book room 217.",
      icon: "🚪"
    },
    {
      title: "Psycho's Chocolate Syrup Blood",
      fact: "The famous shower scene in Psycho (1960) used chocolate syrup as blood because it appeared darker and more viscous on black-and-white film. It took seven days to shoot the 45-second scene.",
      icon: "🍫"
    },
    {
      title: "A Nightmare on Elm Street's Real Inspiration",
      fact: "Wes Craven based Freddy Krueger on a real homeless man who terrorized him as a child. The character was also inspired by news articles about people dying in their sleep after refusing to sleep for days.",
      icon: "😴"
    },
    {
      title: "Halloween's $300 Budget Mask",
      fact: "Michael Myers' iconic mask in Halloween (1978) was actually a Captain Kirk (William Shatner) Star Trek mask painted white and modified. The entire movie was made for just $300,000.",
      icon: "🎭"
    },
    {
      title: "The Texas Chain Saw Massacre's Real Smell",
      fact: "The house used for filming The Texas Chain Saw Massacre (1974) was filled with real rotting meat and bones to create an authentic smell of death. The cast and crew often vomited during filming.",
      icon: "🥩"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-16 w-3 h-3 bg-blood-red rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-24 w-2 h-2 bg-pale-white rounded-full opacity-40 flicker"></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-blood-red rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 right-16 w-2 h-2 bg-pale-white rounded-full opacity-50 flicker"></div>
        <div className="absolute top-1/3 left-1/5 w-3 h-3 bg-blood-red rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-pale-white rounded-full opacity-70 flicker" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Link
            to="/"
            className="flex items-center space-x-2 bg-dark-gray hover:bg-blood-red text-pale-white font-medium py-2 px-4 rounded-lg transition-all duration-300 glow-red-hover shake border border-blood-red/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Realm</span>
          </Link>
          
          <div className="text-center">
            <h1 className="font-creepster text-3xl md:text-4xl text-pale-white animate-pulse">
              Horror Archives
            </h1>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Intro Section */}
          <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6 mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Film className="w-8 h-8 text-blood-red mr-3" />
              <h2 className="font-nosifer text-xl text-pale-white">
                Forbidden Cinema Secrets
              </h2>
              <Eye className="w-8 h-8 text-blood-red ml-3 animate-pulse" />
            </div>
            <p className="text-pale-white/80">
              Uncover the dark truths behind cinema's most terrifying moments...
            </p>
          </div>

          {/* Horror Facts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {horrorFacts.map((fact, index) => (
              <div
                key={index}
                className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6 hover:border-blood-red/50 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl group-hover:animate-bounce">
                    {fact.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blood-red text-lg mb-3 group-hover:text-pale-white transition-colors">
                      {fact.title}
                    </h3>
                    <p className="text-pale-white/80 text-sm leading-relaxed">
                      {fact.fact}
                    </p>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-blood-red/20">
                  <BookOpen className="w-4 h-4 text-pale-white/40" />
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blood-red rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-blood-red rounded-full opacity-40"></div>
                    <div className="w-1 h-1 bg-blood-red rounded-full opacity-20"></div>
                  </div>
                  <Skull className="w-4 h-4 text-pale-white/40" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Quote */}
          <div className="text-center mt-12 mb-8">
            <div className="bg-form-bg/90 backdrop-blur-sm border border-blood-red/30 glow-red rounded-lg p-6">
              <p className="font-nosifer text-pale-white/60 italic text-sm">
                "The most terrifying stories are often the ones that happened behind the camera..."
              </p>
              <div className="flex justify-center mt-4">
                <Eye className="w-5 h-5 text-blood-red animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
