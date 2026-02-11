import { getCRMData, type CRMData } from '../utils/storage';

/**
 * Exports all CRM data and templates to a JSON file
 */
export async function exportToJSON() {
    const data = await getCRMData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `finderflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Exports conversations to a CSV file
 */
export async function exportToCSV() {
    const data = await getCRMData();
    const rows = [
        ['ID', 'Nome', 'Telefone', 'Email', 'Empresa', 'Estagio', 'Tags', 'Notas', 'Ultima Atualizacao']
    ];

    Object.entries(data.conversations).forEach(([id, conv]) => {
        rows.push([
            id,
            conv.name,
            conv.phone || '',
            conv.email || '',
            conv.company || '',
            conv.stage,
            conv.tags.join(';'),
            conv.notes.replace(/\n/g, ' '),
            new Date(conv.lastUpdated).toLocaleString()
        ]);
    });

    const csvContent = rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `finderflow_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Triggers a file selector to import JSON backup
 */
export async function importFromJSON(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const importedData = JSON.parse(content) as CRMData;

                if (importedData.conversations) {
                    await chrome.storage.local.set({ ['crmData']: importedData });
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (err) {
                console.error('Import error:', err);
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
}
