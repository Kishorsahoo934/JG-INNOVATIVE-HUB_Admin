const fs = require('fs');
let content = fs.readFileSync('k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/services/adminApi.ts', 'utf8');

const deleteFunc = `    delete: async (workshopId: string): Promise<any> => {
      return apiRequestRaw(\`/admin/workshops/\${workshopId}\`, {
        method: 'DELETE',
      });
    },`;

if (!content.includes('delete: async (workshopId')) {
    content = content.replace(
        /update: async \(workshopId: string, payload: Partial<Workshop>\): Promise<Workshop> => \{/,
        deleteFunc + "\n    update: async (workshopId: string, payload: Partial<Workshop>): Promise<Workshop> => {"
    );
    fs.writeFileSync('k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/services/adminApi.ts', content);
}

