const fs = require('fs');
let content = fs.readFileSync('k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/components/admin/Sidebar.tsx', 'utf8');

if (!content.includes('import { useLocation')) {
  content = `import { useLocation, NavLink } from 'react-router-dom';\n` + content;
}

fs.writeFileSync('k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/components/admin/Sidebar.tsx', content);
