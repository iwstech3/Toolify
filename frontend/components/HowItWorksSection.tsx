import { Upload, Cpu, BookOpen } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Tool Image",
    description:
      "Take a photo or upload an image of any tool you want to identify.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    description:
      "Our advanced AI analyzes the image and identifies the tool instantly.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Get Documentation",
    description:
      "Receive comprehensive manuals, safety guides, and usage instructions.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get from unknown tool to expert knowledge in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Step circle */}
              <div className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-full bg-card card-shadow flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Step number */}
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
                Step {item.step}
              </span>

              <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
