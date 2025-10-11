
export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="container py-12">
        {children}
      </div>
    </>
  );
}
