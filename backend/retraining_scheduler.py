"""
AMX Protocol – Automated Retraining Scheduler
Simulates the self-improving loop after agent anomalies.
"""

import logging
import time
import threading
from typing import Dict, List
from hedera.hts import get_retraining_log

logger = logging.getLogger("amx.retraining")


class RetrainingScheduler:
    """Manages automated retraining of agents after anomalies."""
    
    def __init__(self):
        self.active_sessions: Dict[str, Dict] = {}
        self.completed_sessions: List[Dict] = []
        self._lock = threading.Lock()
    
    def schedule_retraining(self, agent_name: str, slash_result: Dict):
        """Schedule a retraining session for a penalized agent."""
        with self._lock:
            session_id = f"{agent_name}-{int(time.time())}"
            session = {
                "session_id": session_id,
                "agent": agent_name,
                "slashed_amount": slash_result.get("slashed_amount", 0),
                "penalty_percent": slash_result.get("penalty_percent", 10),
                "status": "queued",
                "started_at": None,
                "completed_at": None,
                "duration_seconds": 0,
                "hard_negatives_added": 1,
                "new_model_hash": None,
                "performance_improvement": 0.0,
                "error_reduction": 0.0,  # New field for visual feedback
            }
            
            self.active_sessions[session_id] = session
            logger.info(f"[Retraining] Scheduled session {session_id} for agent {agent_name}")
            
            # Start simulated retraining in background thread
            threading.Thread(
                target=self._run_retraining_simulation,
                args=(session_id,),
                daemon=True
            ).start()
            
            return session_id
    
    def _run_retraining_simulation(self, session_id: str):
        """Simulate the retraining process with detailed progress updates."""
        import random
        
        # Wait a bit then start
        time.sleep(random.uniform(1.0, 2.0))
        
        with self._lock:
            if session_id not in self.active_sessions:
                return
            
            session = self.active_sessions[session_id]
            session["status"] = "running"
            session["started_at"] = int(time.time())
            logger.info(f"[Retraining] Started session {session_id}")
        
        # Simulate training phases with progress
        phases = [
            ("loading_data", "Loading training data...", 1.0),
            ("preprocessing", "Preprocessing hard negatives...", 1.5),
            ("training", "Training neural network...", 2.5),
            ("validation", "Validating new model...", 1.0),
            ("deployment", "Deploying updated model...", 0.5)
        ]
        
        for phase, description, duration in phases:
            time.sleep(duration)
            
            with self._lock:
                if session_id not in self.active_sessions:
                    return
                
                session = self.active_sessions[session_id]
                session["current_phase"] = phase
                session["phase_description"] = description
                session["progress"] = phases.index((phase, description, duration)) / len(phases) * 100
        
        # Final results
        training_time = sum(phase[2] for phase in phases)
        error_reduction = round(random.uniform(0.08, 0.18), 3)  # 8-18% error reduction
        performance_improvement = round(random.uniform(0.05, 0.15), 3)  # 5-15% improvement
        
        with self._lock:
            if session_id not in self.active_sessions:
                return
            
            session = self.active_sessions[session_id]
            session["status"] = "completed"
            session["completed_at"] = int(time.time())
            session["duration_seconds"] = round(training_time, 1)
            session["new_model_hash"] = f"sha256:retrained-{random.randint(100000, 999999)}"
            session["performance_improvement"] = performance_improvement
            session["error_reduction"] = error_reduction
            session["hard_negatives_added"] = random.randint(2, 5)
            
            # Move to completed
            self.completed_sessions.append(session.copy())
            del self.active_sessions[session_id]
            
            logger.info(
                f"[Retraining] Completed session {session_id} – "
                f"error reduction {error_reduction:.1%}, improvement {performance_improvement:.1%}"
            )
    
    def get_active_sessions(self) -> List[Dict]:
        """Return currently running retraining sessions."""
        with self._lock:
            return list(self.active_sessions.values())
    
    def get_completed_sessions(self) -> List[Dict]:
        """Return completed retraining sessions."""
        with self._lock:
            return list(self.completed_sessions)
    
    def get_all_sessions(self) -> Dict:
        """Return both active and completed sessions."""
        return {
            "active": self.get_active_sessions(),
            "completed": self.get_completed_sessions(),
            "total_completed": len(self.completed_sessions),
        }


# Global scheduler instance
scheduler = RetrainingScheduler()


def auto_schedule_from_slashes():
    """Auto-schedule retraining for recent slash events."""
    recent_slashes = get_retraining_log()[-5:]  # Last 5 slash events
    
    for slash in recent_slashes:
        agent = slash.get("agent")
        if agent and slash.get("retraining_scheduled"):
            # Check if already scheduled
            already_scheduled = any(
                s["agent"] == agent for s in scheduler.get_active_sessions()
            )
            if not already_scheduled:
                scheduler.schedule_retraining(agent, slash)
