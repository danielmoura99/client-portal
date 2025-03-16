// app/(portal)/educational/_components/course-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    description: string;
    slug: string;
  };
  isPurchased: boolean;
}

export function CourseCard({ course, isPurchased }: CourseCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start gap-4 flex-grow">
          <div className="flex-shrink-0">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="font-medium text-zinc-100">{course.name}</h3>
            <p className="text-sm text-zinc-400">{course.description}</p>
          </div>
        </div>

        {isPurchased ? (
          <Button asChild className="w-full mt-4">
            <Link href={`/educational/cursos/${course.slug}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              Acessar Curso
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link
              href={`https://api.whatsapp.com/send?phone=5562993776216`}
              target="_blank"
            >
              <Lock className="mr-2 h-4 w-4" />
              Adquirir Curso
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
