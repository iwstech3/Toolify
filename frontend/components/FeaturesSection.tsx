import {
  Camera,
  FileText,
  Globe,
  MessageSquare,
  Shield,
  Volume2,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Tool Recognition",
    description:
      "Upload any tool image and our AI instantly identifies it using advanced computer vision technology.",
  },
  {
    icon: FileText,
    title: "Auto Documentation",
    description:
      "Get comprehensive user manuals, safety guides, and quick summaries generated automatically.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Access documentation in English, French, and Nigerian Pidgin for global accessibility.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Chat",
    description:
      "Ask questions about any tool and get instant, intelligent responses from our AI assistant.",
  },
  {
    icon: Volume2,
    title: "Audio Guides",
    description:
      "Listen to tool guides with text-to-speech and use voice commands for hands-free operation.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Every tool comes with detailed safety guidelines to ensure proper and safe usage.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Tool Mastery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to identify, understand, and safely use any
            tool—all powered by cutting-edge AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
