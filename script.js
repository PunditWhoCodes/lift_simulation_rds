const form = document.querySelector('.form');
const floorsContainer = document.querySelector('.floors-container');
const mainContainer = document.querySelector('.main-container');
const backButton = document.querySelector('.back-btn'); // Select the back button
const lifts = [];
const pendingQueue = [];

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const numFloorsInput = document.getElementById('floors');
    const numLiftsInput = document.getElementById('lifts');
    const numFloors = Number(numFloorsInput.value);
    const numLifts = Number(numLiftsInput.value);

    if (!numLifts || !numFloors || numFloors < 1 || numLifts < 1) {
        alert('Please enter valid values for both number of floors and number of lifts.');
        return;
    }
    if (numFloors === 1 && numLifts > 1) {
        alert('One Floor can not have more than one lift');
        return;
    }
    // Hide the form and show the back button
    mainContainer.style.display = 'none';
    backButton.style.display = 'block'; // Show the back button
    generateFloors(numFloors);
    generateLifts(numLifts);
});

// Add an event listener to the back button
backButton.addEventListener('click', function () {
    // Show the form and hide the back button
    mainContainer.style.display = 'flex';
    backButton.style.display = 'none';
    
    // Clear the lifts and floors
    floorsContainer.innerHTML = '';  // Clear the generated floors and lifts
    lifts.length = 0;  // Reset lifts array
    pendingQueue.length = 0;  // Reset the queue
});

function generateFloors(numFloors) {
    for (let floor = numFloors; floor >= 1; floor--) {
        const floorDiv = document.createElement('div');
        const floorContent = document.createElement('div');
        floorContent.classList.add('floor-content');

        if (floor !== numFloors) {
            const upButton = document.createElement('button');
            upButton.textContent = 'UP';
            upButton.classList.add('lift-button', 'up-button');
            floorContent.appendChild(upButton);
        }

        if (floor !== 1) {
            const downButton = document.createElement('button');
            downButton.textContent = 'DOWN';
            downButton.classList.add('lift-button', 'down-button');
            floorContent.appendChild(downButton);
        }

        const floorLabel = document.createElement('div');
        floorLabel.textContent = `${floor}`;
        floorLabel.classList.add('floor-label');
        floorDiv.id = `floor-${floor}`;
        floorDiv.appendChild(floorLabel);
        floorDiv.appendChild(floorContent);
        floorsContainer.appendChild(floorDiv);
    }
}

function generateLifts(numLifts) {
    const firstFloor = document.getElementById('floor-1');
    for (let lift = 1; lift <= numLifts; lift++) {
        const liftElement = document.createElement('div');
        liftElement.classList.add('lift');
        liftElement.id = `lift-${lift}`;

        const liftDoorOpening = document.createElement('div');
        liftDoorOpening.classList.add('lift-door', 'left-door');
        liftElement.appendChild(liftDoorOpening);

        const liftDoorClosing = document.createElement('div');
        liftDoorClosing.classList.add('lift-door', 'right-door');
        liftElement.appendChild(liftDoorClosing);
        liftElement.style.position = 'relative';
        firstFloor.appendChild(liftElement);

        lifts.push({
            liftId: `lift-${lift}`,
            currentFloor: 1,
            moving: false,
            direction: null,
            stops: [],
        });
    }

    addLiftButtonListeners();
}
      function addLiftButtonListeners() {
        const liftButtons = document.querySelectorAll('.lift-button');
      
        liftButtons.forEach((button) => {
          button.addEventListener('click', handleLiftButtonClick);
        });
      }
      function handleLiftButtonClick() {
        const floorElement = this.closest('.floor-content');
        const floorNo = parseInt(floorElement.parentNode.id.split('-')[1]);
        const isUpButton = this.classList.contains('up-button');
        const isDownButton = this.classList.contains('down-button');
      
        // Check if any lift is already heading to the floor for the same direction
        const ifLiftAlreadyHeading = lifts.find((lift) =>
            lift.stops.includes(floorNo) && 
            ((isUpButton && lift.direction === 'up') || (isDownButton && lift.direction === 'down'))
        );
    
        if (!ifLiftAlreadyHeading) {
            const requiredLift = findNearestIdleLift(floorNo, isUpButton ? 'up' : 'down');
            if (requiredLift) {
                moveLift(floorNo, requiredLift, isUpButton ? 'up' : 'down');
            } else {
                if (!pendingQueue.includes(floorNo)) {
                    pendingQueue.push({ floorNo, direction: isUpButton ? 'up' : 'down' });
                }
            }
        }
    }
    
    function findNearestIdleLift(floorNo, direction) {
        const idleLifts = lifts.filter((lift) => !lift.moving);
    
        if (idleLifts.length > 0) {
            const nearestLift = idleLifts.reduce((nearest, currentLift) => {
                const distance = Math.abs(floorNo - currentLift.currentFloor);
                if (!nearest || distance < Math.abs(floorNo - nearest.currentFloor)) {
                    return currentLift;
                }
                return nearest;
            }, null);
            return nearestLift;
        } else {
            return null;
        }
    }
    
    function moveLift(floorNo, lift, direction) {
        const liftElement = document.getElementById(lift.liftId);
        const currentFloor = lift.currentFloor;
        
        // CHANGE: Calculate duration based on 2 seconds per floor
        const floorsToTravel = Math.abs(floorNo - currentFloor);
        const totalDuration = floorsToTravel * 2.3; // 2 seconds per floor
    
        lift.moving = true;
        lift.stops.push(floorNo);
        lift.direction = direction;
        
        liftElement.style.transition = `transform ${totalDuration}s linear`;
        liftElement.style.transform = `translateY(-${(floorNo - 1) * 124}px)`;
    
        setTimeout(() => {
            openAndCloseDoors(floorNo, lift);
        }, totalDuration * 1000);
    }
    
    function openAndCloseDoors(floorNo, lift) {
        const liftEl = document.getElementById(lift.liftId);
        const leftDoor = liftEl.querySelector('.left-door');
        const rightDoor = liftEl.querySelector('.right-door');
    
        leftDoor.classList.add('left-move');
        rightDoor.classList.add('right-move');
        
        setTimeout(() => {
            leftDoor.classList.remove('left-move');
            rightDoor.classList.remove('right-move');
            
            setTimeout(() => {
                lift.currentFloor = floorNo;
                lift.moving = false;
                lift.direction = null;
                
                const index = lift.stops.indexOf(floorNo);
                if (index !== -1) {
                    lift.stops.splice(index, 1);
                }
                
                if (lift.stops.length > 0) {
                    const nextStop = lift.stops[0];
                    const nextDirection = nextStop > floorNo ? 'up' : 'down';
                    moveLift(nextStop, lift, nextDirection);
                } else if (pendingQueue.length > 0) {
                    const nextRequest = pendingQueue.shift();
                    moveLift(nextRequest.floorNo, lift, nextRequest.direction);
                }
            }, 2500);
        }, 2500);
    }
    