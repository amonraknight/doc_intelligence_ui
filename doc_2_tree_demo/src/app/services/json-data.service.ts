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

    if (page.para_blocks && Array.isArray(page.para_blocks)) {
      pageNode.children = page.para_blocks
        .map((block: any) => this.processBlock(block, currentXpath))
        .filter((node: TreeNode) => node !== null);
    }

    pageNode.leaf = !pageNode.children || pageNode.children.length === 0;
    return pageNode;
  }

  private processBlock(block: any, xpath: string = ''): TreeNode | null {
    if (!block || typeof block !== 'object') {
      return null;
    }

    const hasPageIdx = block.page_idx !== undefined;
    const hasType = block.type !== undefined;

    if (!hasPageIdx && !hasType) {
      return null;
    }

    const currentXpath = xpath ? `${xpath}/${block.type}` : block.type;
    
    const brief = this.extractBrief(block);

    const node: TreeNode = {
      label: hasPageIdx ? `page${block.page_idx}` : block.type,
      children: [],
      leaf: false,
      brief: brief,
      xpath: currentXpath
    };

    Object.keys(block).forEach((key) => {
      const value = block[key];

      if (key === 'page_idx' || key === 'type') {
        return;
      }

      if (Array.isArray(value)) {
        const childNodes = value
          .map((item: any) => this.processBlock(item, currentXpath))
          .filter((n: TreeNode | null) => n !== null);
        if (childNodes.length > 0) {
          node.children!.push(...childNodes);
        }
      } else if (typeof value === 'object' && value !== null) {
        const childNode = this.processBlock(value, currentXpath);
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
