const _Node = require('./node');

class LL {
  constructor(){
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== this.head) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, this.head);
    }
  }

  insertAt(item, position) { //start at the head 
    let tempNode = this.head; 
    let after; 
    for (let i = 1; i < position - 1; i++) { 
      tempNode = tempNode.next; 
    } 
    after = tempNode.next;  
    tempNode.next = new _Node(item, after); 
    return;
  }

}

module.exports = LL;