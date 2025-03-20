// app/(portal)/educational/_components/course-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    description: string;
    slug: string;
    coverImage?: string | null;
  };
  isPurchased: boolean;
}

export function CourseCard({ course, isPurchased }: CourseCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden flex flex-col w-[300px] ">
      {/* Capa do Curso com dimensões fixas */}
      <div className="relative mx-auto w-[270px] h-[430px]">
        {course.coverImage ? (
          <Image
            src={course.coverImage}
            alt={course.name}
            fill
            className="object-cover"
            sizes="270px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <BookOpen className="h-16 w-16 text-blue-500" />
          </div>
        )}
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          <h3 className="font-medium text-zinc-100">{course.name}</h3>
          <p className="text-sm text-zinc-400">{course.description}</p>
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
