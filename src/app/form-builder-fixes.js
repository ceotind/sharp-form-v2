// This file contains the implementation fixes for the form builder
// Copy appropriate sections into your page.tsx file to fix the issues

// 1. Icons for sidebar - properly stacked buttons
const sidebarIconsCode = `
<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md shadow-sm">
  <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8 p-1.5 bg-white border hover:bg-gray-50 flex items-center justify-center" title="View Form">
    <MaterialIcon name="visibility" filled size={18} color="#0f51dd" />
  </Button>

  <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 p-1.5 bg-white border hover:bg-gray-50 flex items-center justify-center" title="Edit Form">
    <MaterialIcon name="edit" filled size={18} color="#0f51dd" />
  </Button>

  <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 p-1.5 bg-white border hover:bg-red-50 flex items-center justify-center" title="Delete Form">
    <MaterialIcon name="delete" filled size={18} color="#EF4444" />
  </Button>
</div>
`;

// 2. Delete button for main area
const deleteButtonCode = `
<Button
  variant="outline"
  onClick={() => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      deleteForm(selectedFormId);
      router.push('/');
    }
  }}
  className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
  size="sm"
>
  <MaterialIcon name="delete" filled size={16} />
  <span className="hidden md:inline">Delete</span>
</Button>
`;

// 3. Sonner toast implementation
const sonnerToastImplementation = `
// Replace all toast calls with sonnerToast
// For success messages:
sonnerToast.success('Form saved successfully', {
  description: 'Your form has been saved and can now be shared.',
  position: 'top-right',
  className: 'bg-white border-green-500 border-l-4'
});

// For error messages:
sonnerToast.error('Error saving form', {
  description: 'There was a problem saving your form. Please try again.',
  position: 'top-right',
  className: 'bg-white border-red-500 border-l-4'
});

// For informational messages:
sonnerToast.info('Form previewed', {
  description: 'You are now viewing the form as respondents will see it.',
  position: 'top-right',
  className: 'bg-white border-blue-500 border-l-4'
});
`;

// 4. Material Icons pattern
const materialIconsUsage = `
// Replace Lucide icons with Material icons for consistency
<Button 
  onClick={() => handleFieldSelect({ 
    id: uuidv4(),
    type: 'text', 
    label: 'Short Text', 
    placeholder: 'Enter text...', 
    required: false 
  })}
  variant="outline" 
  className="h-auto p-4 flex flex-col items-center gap-2 hover:border-[#0f51dd] hover:bg-[#0f51dd]/5 border-gray-200"
>
  <MaterialIcon name="short_text" filled size={20} color="#0f51dd" />
  <span className="text-sm font-medium">Short Text</span>
  <span className="text-xs text-gray-500">Single line answer</span>
</Button>
`;

// 5. Form Properties and Theme cards side by side
const sideByLayoutCode = `
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Form Properties Card */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MaterialIcon name="description" filled size={20} color="currentColor" /> 
        Form Properties
      </CardTitle>
      <CardDescription>Basic information about your form</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Form properties content */}
    </CardContent>
  </Card>
  
  {/* Theme Settings Card */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MaterialIcon name="palette" filled size={20} color="currentColor" /> 
        Form Theme
      </CardTitle>
      <CardDescription>Customize the appearance of your form</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Theme settings content */}
    </CardContent>
  </Card>
</div>
`;

// 6. User friendliness improvements
const userFriendlinessCode = `
// Clear spacing, consistent button sizes, and better visual hierarchy
<Button 
  variant="default" 
  size="sm"
  onClick={handlePublish}
  disabled={isPublishing}
  className="bg-[#0f51dd] hover:bg-[#0a3eaf] text-white h-9 px-4 rounded-md flex items-center gap-2"
>
  <MaterialIcon name="save" size={18} />
  {isPublishing ? 'Publishing...' : 'Publish Form'}
</Button>

// Improved feedback when no fields are added
{fields.length === 0 && (
  <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
    <MaterialIcon name="add_circle" size={40} color="#9CA3AF" />
    <p className="mt-2 font-medium text-gray-700">No form elements added yet</p>
    <p className="text-sm text-gray-500 mt-1">Add form elements from the panel below</p>
    <Button
      onClick={() => document.getElementById('form-elements-section')?.scrollIntoView({ behavior: 'smooth' })}
      variant="outline"
      className="mt-4"
    >
      <MaterialIcon name="arrow_downward" size={16} className="mr-2" />
      Browse Elements
    </Button>
  </div>
)}
`;
