import { cn } from "@/lib/utils";

export const Component = () => {
  return (
    <div className={cn("flex h-screen w-full items-center justify-center bg-black")}>
      <div className="h-full w-full max-w-5xl overflow-hidden rounded-xl border border-gray-700 shadow-2xl">
        <iframe
          src="https://my.spline.design/untitled-rv0hx3zVdoM6t2ydngxuS7zi/"
          className="h-full w-full"
          frameBorder="0"
          allowFullScreen
          title="Robot flyby"
        />
      </div>
    </div>
  );
};
