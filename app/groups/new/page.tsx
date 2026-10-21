import GroupForm from "@/components/GroupForm";

export default function NewGroupPage() {
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl text-paper">Нова група</h1>
      <p className="mb-4 text-sm text-muted">
        Ти будеш адміном групи й зможеш постити в ній. Підписники бачать пости,
        лайкають і коментують. У загальній стрічці ці пости не показуються.
      </p>
      <GroupForm />
    </div>
  );
}
