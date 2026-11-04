import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    const clients = this.getClients();
    this.state = {
      clients: {
        backlog: clients.filter(client => !client.status || client.status === 'backlog'),
        inProgress: clients.filter(client => client.status && client.status === 'in-progress'),
        complete: clients.filter(client => client.status && client.status === 'complete'),
      }
    }
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    }
  }

  componentDidMount() {
    const { backlog, inProgress, complete } = this.swimlanes;

    this.drake = Dragula([
      backlog.current,
      inProgress.current,
      complete.current,
    ]);

    this.drake.on('drop', (el, target, source, sibling) => {
      // Revert Dragula's DOM move — React re-renders from updated state
      this.drake.cancel(true);

      const cardId = el.dataset.id;

      // Map target DOM node → status string + state key
      let newStatus = 'backlog';
      let targetKey = 'backlog';
      if (target === inProgress.current) { newStatus = 'in-progress'; targetKey = 'inProgress'; }
      else if (target === complete.current) { newStatus = 'complete';  targetKey = 'complete'; }

      this.setState(prevState => {
        // Find the dragged card across all lanes
        const allClients = [
          ...prevState.clients.backlog,
          ...prevState.clients.inProgress,
          ...prevState.clients.complete,
        ];
        const draggedCard = allClients.find(c => c.id === cardId);
        if (!draggedCard) return null;

        const updatedCard = { ...draggedCard, status: newStatus };

        // Remove card from every lane
        const newClients = {
          backlog:    prevState.clients.backlog.filter(c => c.id !== cardId),
          inProgress: prevState.clients.inProgress.filter(c => c.id !== cardId),
          complete:   prevState.clients.complete.filter(c => c.id !== cardId),
        };

        // Insert at the correct position using Dragula's sibling reference
        const targetLane = [...newClients[targetKey]];
        if (sibling) {
          const siblingIndex = targetLane.findIndex(c => c.id === sibling.dataset.id);
          if (siblingIndex !== -1) {
            targetLane.splice(siblingIndex, 0, updatedCard);
          } else {
            targetLane.push(updatedCard);
          }
        } else {
          targetLane.push(updatedCard);
        }
        newClients[targetKey] = targetLane;

        return { clients: newClients };
      });
    });
  }

  componentWillUnmount() {
    if (this.drake) this.drake.destroy();
  }

  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'in-progress'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'complete'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'in-progress'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'in-progress'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'complete'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'complete'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'in-progress'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'in-progress'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'complete'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }

  renderSwimlane(name, clients, ref) {
    return (
      <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
