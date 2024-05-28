from dataclasses import dataclass
import re


@dataclass
class PublicationDTO:
    title: str
    url: str
    price: float
    km: int
    year: int
    location: str
    img_url: str
    car_brand: str

    def __str__(self):
        return f"Title: {self.title}, Price: {self.price}, KM: {self.km}, Year: {self.year}, Location: {self.location}\nURL: {self.url}\nIMG URL: {self.img_url}"
    
    def get_publication_id(self) -> str:
        # Define the regex pattern to find the number after "MLA-"
        pattern = r'MLA-(\d+)'
        match = re.search(pattern, self.url)
        if match:
            return match.group(1)
        raise ValueError(f"The url {self.url} doesn't seem to have a publication ID")
    
    def to_dict(self) -> dict:
        return {
            'id': self.get_publication_id(),  # Using publication ID as the document ID
            'title': self.title,
            'url': self.url,
            'price': self.price,
            'km': self.km,
            'year': self.year,
            'location': self.location,
            'img_url': self.img_url,
            'car_brand': self.car_brand
        }
