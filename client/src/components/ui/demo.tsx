import GlassyCarousel, { type GlassyCarouselItem } from "@/components/ui/glassy-coverflow-carousel";

export const films: GlassyCarouselItem[] = [
  {
    id: "john-wick-chapter-4",
    title: "John Wick: Chapter 4",
    subtitle: "2023 · Action thriller",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    accent: "#ef4444",
    description: "John Wick takes his fight against the High Table across the world in pursuit of his freedom.",
    trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4",
  },
  {
    id: "mad-max-fury-road",
    title: "Mad Max: Fury Road",
    subtitle: "2015 · Post-apocalyptic action",
    image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    accent: "#dc2626",
    description: "Max and Furiosa race across the wasteland with a ruthless warlord in pursuit.",
    trailerUrl: "https://www.youtube.com/watch?v=hEJnMQG9ev8",
  },
  {
    id: "mission-impossible-fallout",
    title: "Mission: Impossible - Fallout",
    subtitle: "2018 · Spy action",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    accent: "#b91c1c",
    description: "Ethan Hunt and his team race to recover stolen plutonium after a mission goes wrong.",
    trailerUrl: "https://www.youtube.com/watch?v=wb49-oV0F78",
  },
  {
    id: "extraction-2",
    title: "Extraction 2",
    subtitle: "2023 · Action thriller",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
    accent: "#991b1b",
    description: "Tyler Rake returns for a dangerous rescue mission to extract a family from a Georgian prison.",
    trailerUrl: "https://www.youtube.com/watch?v=Y274jZs5s7s",
  },
  {
    id: "the-fall-guy",
    title: "The Fall Guy",
    subtitle: "2024 · Action comedy",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&auto=format&fit=crop&q=80",
    accent: "#f87171",
    description: "A stunt performer searches for a missing movie star while trying to save the film.",
    trailerUrl: "https://www.youtube.com/watch?v=j7jPnwVGdZ8",
  },
];

// Red and black theme matching Moviefy dark cinematic aesthetic
export const redBlackCinemaTheme: React.CSSProperties = {
  "--color-background": "#000000",
  "--color-foreground": "#ffffff",
  "--color-card": "#0a0a0a",
  "--color-card-foreground": "#fca5a5",
  "--color-muted-foreground": "#9ca3af",
  "--color-border": "#dc262640",
  "--color-primary": "#ef4444",
  "--color-primary-foreground": "#ffffff",
  "--carousel-background": "#000000",
  "--carousel-shadow-color": "#dc2626",
} as React.CSSProperties;

export default function GlassyCarouselDemo() {
  return (
    <div className="w-full min-w-0 bg-black">
      <GlassyCarousel
        items={films}
        layout="poster"
        initialIndex={2}
        autoPlay={true}
        label="Featured 3D Action Movies"
        style={redBlackCinemaTheme}
        brand={{
          text: "MOVIEFY 3D PREVIEW",
          href: "/",
        }}
      />
    </div>
  );
}

