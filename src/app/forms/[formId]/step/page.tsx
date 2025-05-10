import StepForm from './StepForm';

export default function FormStepPage({
  params,
}: {
  params: { formId: string };
}) {
  return <StepForm formId={params.formId} />;

export default function FormStepPage(props: Props) {
  const { params } = props;
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const docRef = doc(db, 'forms', params.formId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setForm(docSnap.data() as Form);
        } else {
          setError('Form not found');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [params.formId]);

  // ... rest of the code remains the same ...
} 