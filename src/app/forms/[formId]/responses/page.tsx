'use client';

import ResponsesComponent from './ResponsesComponent';

export default function FormResponsesPage({
  params,
}: {
  params: { formId: string };
}) {
  return <ResponsesComponent formId={params.formId} />;
}
