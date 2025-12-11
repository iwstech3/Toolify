import Link from "next/link";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl hero-gradient p-12 md:p-16 text-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Identify Any Tool?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of users who are already using Toolify to master
              their tools. Start for free today.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="xl"
                className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                asChild
              >
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
