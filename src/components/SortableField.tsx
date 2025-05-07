import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FormField } from '@/types/form';

interface SortableFieldProps {
  field: FormField;
  onEdit: () => void;
  onRemove: () => void;
}

export function SortableField({ field, onEdit, onRemove }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move p-2 hover:bg-gray-100 rounded"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">{field.label}</h3>
            <p className="text-sm text-gray-500">{field.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
} 