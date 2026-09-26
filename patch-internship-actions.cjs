const fs = require('fs');
const filePath = 'k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/pages/Internships.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `<div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => handleViewApp(app)}`;

const replacement = `<div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => openEditForm(app)}
            title="Edit Application"
          >
            <Pencil className="w-4 h-4 text-primary" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => handleViewApp(app)}`;

// Normalize for line endings to make replacement easy
content = content.replace(new RegExp(target.replace(/\r?\n/g, '\\s*')), replacement);

fs.writeFileSync(filePath, content);
