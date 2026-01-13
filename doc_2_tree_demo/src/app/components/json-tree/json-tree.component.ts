import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { JsonDataService, TreeNode } from '../../services/json-data.service';

@Component({
  selector: 'app-json-tree',
  standalone: true,
  imports: [CommonModule, TreeModule, ButtonModule, FormsModule],
  templateUrl: './json-tree.component.html',
  styleUrl: './json-tree.component.scss'
})
export class JsonTreeComponent implements OnInit {
  private jsonDataService = inject(JsonDataService);

  files: string[] = [];
  selectedFile: string = '';
  treeData: TreeNode[] = [];
  selectedNodes: TreeNode[] = [];

  ngOnInit(): void {
    this.files = this.jsonDataService.getAllJsonFiles();
    if (this.files.length > 0) {
      this.selectedFile = this.files[0];
      this.loadJsonData();
    }
  }

  onFileChange(): void {
    this.loadJsonData();
  }

  private loadJsonData(): void {
    if (!this.selectedFile) {
      return;
    }

    this.jsonDataService.loadJsonData(this.selectedFile).subscribe({
      next: (data: any) => {
        this.treeData = this.jsonDataService.transformJsonToTree(data);
        this.selectedNodes = [];
      },
      error: (err: any) => {
        console.error('Error loading JSON data:', err);
      }
    });
  }

  nodeSelect(event: any): void {
    console.log('Node selected:', event.node);
  }

  nodeUnselect(event: any): void {
    console.log('Node unselected:', event.node);
  }

  exportSelectedNodes(): void {
    const xpaths = this.selectedNodes.map(node => node.xpath).filter(xpath => xpath);
    console.log('Selected XPaths:', xpaths);
  }
}
