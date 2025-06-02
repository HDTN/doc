import fs from 'fs-extra';
import path from 'path';

const docsJsonPath = path.join(process.cwd(), 'docs.json');

/**
 * Função recursiva para obter a estrutura de páginas em uma estrutura de diretórios
 * @param basePath Caminho base dos endpoints
 * @param currentPath Caminho atual sendo processado
 * @param relativePath Caminho relativo para construção das URLs
 */
async function getNestedPages(basePath: string, currentPath: string, relativePath: string): Promise<any[]> {
  const items = await fs.readdir(currentPath, { withFileTypes: true });
  const result: any[] = [];

  // Agrupar por diretórios
  const directories = items.filter(item => item.isDirectory());
  for (const dir of directories) {
    const dirPath = path.join(currentPath, dir.name);
    const dirRelativePath = path.join(relativePath, dir.name);
    
    // Verifica se há arquivos MDX diretamente dentro deste diretório
    const dirItems = await fs.readdir(dirPath, { withFileTypes: true });
    const mdxFiles = dirItems.filter(item => item.isFile() && item.name.endsWith('.mdx'));
    
    if (mdxFiles.length > 0) {
      // Este diretório contém arquivos MDX, então é um grupo de endpoints
      result.push({
        group: dir.name,
        pages: mdxFiles.map(file => `${dirRelativePath}/${file.name.replace('.mdx', '')}`)
      });
    } else {
      // Este diretório contém subdiretórios, explorar recursivamente
      const nestedPages = await getNestedPages(basePath, dirPath, dirRelativePath);
      if (nestedPages.length > 0) {
        result.push({
          group: dir.name,
          pages: nestedPages
        });
      }
    }
  }

  // Adicionar arquivos MDX do diretório atual
  const mdxFiles = items.filter(item => item.isFile() && item.name.endsWith('.mdx'));
  if (mdxFiles.length > 0) {
    result.push(...mdxFiles.map(file => `${relativePath}/${file.name.replace('.mdx', '')}`));
  }

  return result;
}

export async function updateDocsJson() {
  const apiReferencePath = path.join(process.cwd(), 'api-reference');
  const docsJson = await fs.readJson(docsJsonPath);

  const services = await fs.readdir(apiReferencePath, { withFileTypes: true });
  const serviceDirectories = services.filter(item => item.isDirectory());

  const apiReferenceGroup = docsJson.navigation.tabs.find((tab: any) => tab.tab === 'API Reference');
  if (!apiReferenceGroup) {
    throw new Error('A aba "API Reference" não foi encontrada no docs.json.');
  }

  apiReferenceGroup.groups = [];
  
  for (const serviceDir of serviceDirectories) {
    const serviceName = serviceDir.name;
    const servicePath = path.join(apiReferencePath, serviceName);
    const endpointsPath = path.join(servicePath, 'endpoints');
    
    if (fs.existsSync(endpointsPath)) {
      const serviceGroup = {
        group: serviceName,
        pages: await getNestedPages(endpointsPath, endpointsPath, `api-reference/${serviceName}/endpoints`)
      };
      
      apiReferenceGroup.groups.push(serviceGroup);
    }
  }

  await fs.writeJson(docsJsonPath, docsJson, { spaces: 2 });
  console.log('docs.json atualizado com sucesso!');
}