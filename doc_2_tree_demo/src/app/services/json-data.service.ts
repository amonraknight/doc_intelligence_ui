import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TreeNode {
  label: string;
  data?: any;
  children?: TreeNode[];
  leaf?: boolean;
  expandedIcon?: string;
  collapsedIcon?: string;
  brief?: string;
  xpath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JsonDataService {
  constructor(private http: HttpClient) {}

  loadJsonData(filename: string): Observable<any> {
    return this.http.get(`/assets/resources/${filename}`);
  }

  transformJsonToTree(jsonData: any): TreeNode[] {
    const pdfInfo = jsonData.pdf_info;
    if (!pdfInfo || !Array.isArray(pdfInfo)) {
      return [];
    }

    return pdfInfo.map((page: any) => this.processPage(page));
  }

  private processPage(page: any): TreeNode {
    const pageIdx = page.page_idx;
    const currentXpath = `pdf_info[${pageIdx}]`;
    
    const pageNode: TreeNode = {
      label: pageIdx !== undefined ? `page${pageIdx}` : 'Unknown Page',
      children: [],
      leaf: false,
      xpath: currentXpath
    };

    Object.keys(page).forEach((key) => {
      const value = page[key];

      if (key === 'page_idx' || key === 'type') {
        return;
      }

      if (Array.isArray(value)) {
        const childNodes = this.processArray(value, currentXpath, key);
        if (childNodes.length > 0) {
          pageNode.children!.push(...childNodes);
        }
      } else if (typeof value === 'object' && value !== null) {
        const childNode = this.processObject(value, currentXpath, key);
        if (childNode) {
          pageNode.children!.push(childNode);
        }
      }
    });

    pageNode.leaf = !pageNode.children || pageNode.children.length === 0;
    return pageNode;
  }

  private processArray(items: any[], xpath: string, arrayType: string): TreeNode[] {
    return items.map((item: any, index: number) => {
      const itemXpath = `${xpath}/${arrayType}[${index}]`;
      return this.processItem(item, itemXpath, arrayType, index);
    }).filter((node: TreeNode | null) => node !== null) as TreeNode[];
  }

  private processItem(item: any, xpath: string, arrayType: string, index: number): TreeNode | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const hasType = item.type !== undefined;
    const label = hasType ? item.type : `${arrayType === 'para_blocks' ? 'block' : arrayType.slice(0, -1)}${index}`;
    
    const brief = this.extractBrief(item);

    const node: TreeNode = {
      label: label,
      children: [],
      leaf: false,
      brief: brief,
      xpath: xpath
    };

    Object.keys(item).forEach((key) => {
      const value = item[key];

      if (key === 'page_idx' || key === 'type') {
        return;
      }

      if (Array.isArray(value)) {
        const childNodes = this.processArray(value, xpath, key);
        if (childNodes.length > 0) {
          node.children!.push(...childNodes);
        }
      } else if (typeof value === 'object' && value !== null) {
        const childNode = this.processObject(value, xpath, key);
        if (childNode) {
          node.children!.push(childNode);
        }
      }
    });

    node.leaf = !node.children || node.children.length === 0;
    return node;
  }

  private processObject(obj: any, xpath: string, key: string): TreeNode | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    const hasType = obj.type !== undefined;
    const label = hasType ? obj.type : key;
    
    const brief = this.extractBrief(obj);

    const node: TreeNode = {
      label: label,
      children: [],
      leaf: false,
      brief: brief,
      xpath: `${xpath}/${key}`
    };

    Object.keys(obj).forEach((objKey) => {
      const value = obj[objKey];

      if (objKey === 'page_idx' || objKey === 'type') {
        return;
      }

      if (Array.isArray(value)) {
        const childNodes = this.processArray(value, node.xpath!, objKey);
        if (childNodes.length > 0) {
          node.children!.push(...childNodes);
        }
      } else if (typeof value === 'object' && value !== null) {
        const childNode = this.processObject(value, node.xpath!, objKey);
        if (childNode) {
          node.children!.push(childNode);
        }
      }
    });

    node.leaf = !node.children || node.children.length === 0;
    return node;
  }

  private extractBrief(block: any): string {
    if (!block.lines || !Array.isArray(block.lines)) {
      return '';
    }

    const contents: string[] = [];
    
    for (const line of block.lines) {
      if (line.spans && Array.isArray(line.spans)) {
        for (const span of line.spans) {
          if (span.content && typeof span.content === 'string') {
            contents.push(span.content);
          } else if (span.html && typeof span.html === 'string') {
            contents.push(span.html);
          }
        }
      }
    }

    const result = contents.join('');
    return result.length > 200 ? result.slice(0, 200) + '…' : result;
  }

  getAllJsonFiles(): string[] {
    return [
      'MinerU_cross_page_table_sample_1.json',
      'MinerU_invoice_sample_1_Contractor Customer Invoice.json',
      'MinerU_invoice_sample_2 Contractor Invoice.json',
      'MinerU_invoice_sample_3 Project Customer Invoice.json',
      'mineru_output_sample_1.JSON',
      'mineru_output_sample_2.JSON'
    ];
  }
}
