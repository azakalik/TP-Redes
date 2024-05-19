from dataclasses import dataclass


@dataclass
class PublicationDTO:
    title: str
    url: str
    price: float
    km: int
    year: int
    location: str
    img_url: str

    def __str__(self):
        return f"Title: {self.title}, Price: {self.price}, KM: {self.km}, Year: {self.year}, Location: {self.location}\nURL: {self.url}\nIMG URL: {self.img_url}"
