import { Component, Input, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-string-group',
  imports: [FormsModule],
  templateUrl: './string-group.html',
  styleUrl: './string-group.scss'
})
export class StringGroup implements OnInit {
  @Input({required: true}) Label: string = "No label provided ?";
  @Input({required: true}) Items: string[] = [];

  userInput: string = "";

  constructor(){

  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  onKeyUp() {
    this.addElement(this.userInput);
  }

  removeItem(input: string | null) {
    if (!input) return;
    this.Items = this.Items.filter(x => x !== input);
  }

  addElement(input: string | null) {
    if (!input) return;
    if (this.Items.indexOf(input) > -1) {
      return;
    }
    this.Items.push(input)
    this.userInput = "";
  }
}
 