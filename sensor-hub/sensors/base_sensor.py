from abc import ABC, abstractmethod
from typing import Dict

class BaseSensor(ABC):
    """Clase base para sensores físicos o simulados."""

    def __init__(self, name: str, group: str):
        self.name = name      # Ej: "roll", "rpm"
        self.group = group    # Ej: "mechanical", "thermal"

    @abstractmethod
    def read(self) -> Dict[str, float]:
        """Debe devolver un diccionario de métricas."""
        pass
