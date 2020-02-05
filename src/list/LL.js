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
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
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

  remove(item) {
    if (!this.head) {
      return null;
    }
    if (this.head.value === item) {
      return this.head;
    }
    let currNode = this.head.next;
    let previousNode = this.head;

    while (
      currNode !== null &&
      currNode.value !== item
    ) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Item not found');
      return;
    } else {
      previousNode.next = currNode.next;
    }
  }

}

module.exports = LL;