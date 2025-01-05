// app/(portal)/requests/new/page.tsx
import { RequestForm } from "../_components/request-form";

export default function NewRequestPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Nova Solicitação</h1>
        <p className="text-zinc-400">Preencha os detalhes da sua solicitação</p>
      </div>

      <RequestForm />
    </div>
  );
}
